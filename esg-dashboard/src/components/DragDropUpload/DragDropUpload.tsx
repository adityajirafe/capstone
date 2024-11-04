import './DragDropUpload.css';
import { Text } from '@chakra-ui/react';

interface DragDropUploadProps {
  file: File | null;
  handleFileChange: (file: File | null) => void;
}

const DragDropUpload = (props: DragDropUploadProps) => {
  // const [file, handleFileChange] = useState<File | null>(null);
  const { file, handleFileChange } = props;

  const handleFileAdd = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;
    if (selectedFile && selectedFile.type === "application/pdf") {
      handleFileChange(selectedFile);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLInputElement>) => {
    event.preventDefault();
    const droppedFile = event.dataTransfer?.files[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      handleFileChange(droppedFile);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLInputElement>) => {
    event.preventDefault();
    const draggedFile = event.dataTransfer.items[0];
    if (draggedFile && draggedFile.kind === "file" && draggedFile.type !== "application/pdf") {
      event.dataTransfer.dropEffect = "none"; // Disallows drop
    } else {
      event.dataTransfer.dropEffect = "copy"; // Allows drop
    }
  };

  return (
    <section className="drag-drop">
      <div
        className={`document-uploader ${file ? "upload-box active" : "upload-box"}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="upload-info">
            <Text fontSize={26} fontWeight={500} mb="16px">Choose a file or drag and drop it here</Text>
            <Text color="primary" fontSize={18} fontWeight={500}>PDF format, up to 15MB</Text>
        </div>
        <div className='browse-btn-container'>
          <input
            type="file"
            hidden
            id="browse"
            onChange={handleFileAdd}
            accept=".pdf"
            />
          <label htmlFor="browse" className="browse-btn">
            Browse
          </label>
        </div>
        
      </div>
      {file && (
          <div className="success-file">
            <p>1 file selected</p>
          </div>
        )}
    </section>
  );
};

export default DragDropUpload;
