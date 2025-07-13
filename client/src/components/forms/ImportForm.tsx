import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
} from '@mui/material';

interface ImportModalProps {
  open: boolean;
  onClose: () => void;
  onImport: (file: File) => void;
}

const ImportModal: React.FC<ImportModalProps> = ({ open, onClose, onImport }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tableData, setTableData] = useState<string[][]>([]);

  useEffect(() => {
    if (selectedFile) {
      const reader = new FileReader();

      reader.onload = (event) => {
        if (event.target?.result) {
          const content = event.target.result as string;
          const rows = content.split('\n').map((row) => row.split(','));
          setTableData(rows);
        }
      };

      reader.readAsText(selectedFile);
    }
  }, [selectedFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleConfirmImport = () => {
    if (selectedFile) {
      onImport(selectedFile);
      setSelectedFile(null);
      setTableData([]);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="import-modal-title">
      <DialogTitle id="import-modal-title">Import CSV</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Please select a CSV file to import:
        </DialogContentText>
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
        />
        {tableData.length > 0 && (
          <TableContainer component={Paper}>
            <Table aria-label="CSV Preview">
              <TableHead>
                <TableRow>
                  {tableData[0].map((header, index) => (
                    <TableCell key={index}>{header}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {tableData.slice(1).map((row, index) => (
                  <TableRow key={index}>
                    {row.map((cell, index) => (
                      <TableCell key={index}>{cell}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleConfirmImport} color="primary" disabled={!selectedFile}>
          Import
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportModal;
