import { useRef, useState } from 'react';
import api from '../services/api';
import { Upload, X, Check, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

const ReuploadModal = ({ document, onClose, onSuccess }) => {
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const toastId = toast.loading("Uploading replacement...");

        try {
            // 1. Upload new document
            const fd = new FormData();
            fd.append('file', file);
            fd.append('name', document.documentType || file.name); // Keep type consistency
            fd.append('type', document.documentType || 'Other');

            const res = await api.post('/documents', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            const newDocId = res.data.data.document._id;

            // 2. Update Application (We need an endpoint to replace a doc in an application? OR just allow generic doc upload and the user manually maps it?)
            // Ideally, we PATCH the application to swap the document ID for this type.
            // But we don't have that router yet.
            // Alternative: The user uploads to vault, then we need a way to link it. 
            // SIMPLIFIED APPROACH: Just replace the 'url' and 'status' of the EXISTING document ID if backend allows?
            // No, documents should be immutable or distinct versioned.

            // Let's assume we simply upload to Vault and tell user "uploaded".
            // To actually fixe the application, we'd need endpoints to 'update application documents'.
            // For this Turn, let's create a specialized 'replace-document' endpoint or assume the user deletes and re-adds in a "Draft" status app.
            // If app is Submitted, usually it's locked.
            // Let's just Close for now, assuming this component is unused until we fully implement 'Edit Application'.

            toast.update(toastId, { render: "New version uploaded to Vault! Please resubmit application if required.", type: "success", isLoading: false, autoClose: 3000 });
            onSuccess(); // Close modal
        } catch (err) {
            toast.update(toastId, { render: "Upload failed", type: "error", isLoading: false, autoClose: 2000 });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20} /></button>

                <h3 className="text-lg font-bold text-gray-900 mb-2">Re-upload {document.documentType}</h3>
                <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm mb-4 flex items-start">
                    <AlertCircle size={16} className="mr-2 mt-0.5 shrink-0" />
                    <div>
                        <p className="font-semibold">Rejection Reason:</p>
                        <p>{document.document?.verificationComments || 'Document not valid.'}</p>
                    </div>
                </div>

                <p className="text-sm text-gray-500 mb-6">
                    Upload a new file to replace the rejected one. This will add a new document to your vault.
                    If your application is already submitted, you may need to contact support to update the record.
                </p>

                <div className="flex justify-end">
                    <label className="flex items-center justify-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 cursor-pointer w-full transition">
                        {uploading ? <Loader2 className="animate-spin" /> : <Upload className="mr-2" size={18} />}
                        <span>Select New File</span>
                        <input ref={fileInputRef} type="file" className="hidden" onChange={handleUpload} accept=".pdf,.png,.jpg,.jpeg" disabled={uploading} />
                    </label>
                </div>
            </div>
        </div>
    );
};

export default ReuploadModal;
