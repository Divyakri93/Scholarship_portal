exports.calculateEligibility = (user, scholarship) => {
    const reasons = [];
    let isEligible = true;

    // 1. GPA Check
    const userGPA = user.academicProfile?.gpa || 0;
    const minGPA = scholarship.eligibility?.minGPA || 0;
    if (userGPA < minGPA) {
        isEligible = false;
        reasons.push(`GPA ${userGPA} is below minimum requirement of ${minGPA}`);
    }

    // 2. Income Check
    const userIncome = user.financialProfile?.annualIncome;
    const maxIncome = scholarship.eligibility?.maxIncome;
    // Only check if maxIncome is defined and greater than 0
    if (maxIncome && maxIncome > 0) {
        // If user income is missing, maybe warn or fail? Let's fail strict.
        if (userIncome === undefined || userIncome === null) {
            // Treat missing income as ineligible for need-based? OR eligible but warn.
            // Let's say: if maxIncome is set, user MUST provide income.
            isEligible = false;
            reasons.push("Annual income information is missing from your profile");
        } else if (userIncome > maxIncome) {
            isEligible = false;
            reasons.push(`Annual income $${userIncome} exceeds maximum limit of $${maxIncome}`);
        }
    }

    // 3. Course Check
    const userCourse = user.academicProfile?.course;
    const allowedCourses = scholarship.eligibility?.allowedCourses || [];
    if (allowedCourses.length > 0) {
        if (!userCourse || !allowedCourses.includes(userCourse)) {
            // Very strict match. Ideally we might want case-insensitive or partial match.
            // For now, let's keep it consistent with DB query.
            isEligible = false;
            reasons.push(`Your course '${userCourse || "N/A"}' is not in the allowed list: ${allowedCourses.join(', ')}`);
        }
    }

    return { isEligible, reasons };
};

exports.calculateApplicationScore = (user, scholarship) => {
    let score = 0;

    // Weights
    const W_GPA = 60; // 60% weight to Merit
    const W_NEED = 40; // 40% weight to Need

    // 1. Merit Score (GPA)
    // Assume max GPA is 4.0. If scholarship.minGPA is 3.0, we scale.
    // Simple approach: (UserGPA / 4.0) * W_GPA
    const userGPA = parseFloat(user.academicProfile?.gpa) || 0;
    let meritScore = Math.min((userGPA / 4.0), 1) * W_GPA;

    // Bonus for exceeding minGPA significanty?
    // Let's stick to simple linear scale for now.
    score += meritScore;


    // 2. Need Score (Income)
    // If scholarship has maxIncome, lower income gets higher score.
    // If no maxIncome, we might still reward lower income or ignore.
    const maxIncome = scholarship.eligibility?.maxIncome || 100000; // Default baseline if undefined
    const userIncome = parseFloat(user.financialProfile?.annualIncome) || 0;

    if (userIncome < maxIncome) {
        // Linear inverse: 0 income = max points. maxIncome = 0 points.
        // Ratio = (max - user) / max
        let needRatio = Math.max(0, (maxIncome - userIncome) / maxIncome);
        score += needRatio * W_NEED;
    }

    return Math.round(score);
};
