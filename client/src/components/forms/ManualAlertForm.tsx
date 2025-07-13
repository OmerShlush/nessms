import React, { useState } from 'react';
import { TextField, Button, Paper, Typography, Container, Tooltip } from '@mui/material';
import { Radio, RadioGroup, FormControlLabel } from '@mui/material';
import Papa from 'papaparse';

import importIcon from '../../assets/ImportIcon.png';
import { IContactNotification } from '../../interfaces/contact.interface';
import ImportModal from './ImportForm';
interface ManualAlertFormProps {
  onSubmit: (method: string, contacts: string[], policyGroups: string[], title: string, content: string) => void;
}

const ManualAlertForm: React.FC<ManualAlertFormProps> = ({ onSubmit }) => {
  const [method, setMethod] = useState('Email');
  const [contacts, setContacts] = useState<string[]>([]);
  const [policyGroups, setPolicyGroups] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [remainingCharacters, setRemainingCharacters] = useState<number>(160);

  // Import Contacts
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    const remainingChars = 160 - newContent.length;
    setRemainingCharacters(remainingChars);
  };

  const handleSubmit = () => {
    onSubmit(method, contacts, policyGroups, title, content);
    setMethod('Email');
    setContacts([]);
    setPolicyGroups([]);
    setTitle('');
    setContent('');
    setRemainingCharacters(160);
  };

  const handleImportCSV = async (file: File) => {
    try {
      setIsImportModalOpen(false);
      const text = await file.text();

      // Parse the CSV data using PapaParse
      const { data } = Papa.parse<IContactNotification>(text, { header: true });

      // Process each data row and create the desired IContact objects
      const contacts: IContactNotification[] = data
        .filter((row) => {
          return (
            row.name &&
            row.phone &&
            row.email
          );
        })

      if (method === 'SMS') {
        setContacts(contacts.map((contact) => contact.phone).filter(phone => phone !== undefined) as string[]);
      } else {
        setContacts(contacts.map((contact) => contact.email).filter(email => email !== undefined) as string[]);
      }
    } catch (error) {
      console.error('Error importing CSV:', error);
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} style={{ padding: '24px', marginTop: '24px', textAlign: 'center' }}>
        <Typography variant="h5">Manual Notifications</Typography>
        <Tooltip title="Import CSV">
          <div style={{ float: 'right' }}>
            <img
              src={importIcon}
              alt="Import CSV"
              style={{ margin: '0 0 15px 15px', cursor: 'pointer', width: '30px', height: '30px', display: 'block', textAlign: 'center'}}
              onClick={() => setIsImportModalOpen(true)}
            />
            <p>Import Contacts</p>
          </div>
        </Tooltip>

        <ImportModal
          open={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onImport={handleImportCSV} // Implement the import logic here
        />
        <RadioGroup
          aria-label="Method"
          name="method"
          value={method}
          onChange={(e) => setMethod(e.target.value)}
        >
          <FormControlLabel value="Email" control={<Radio />} label="Email" />
          <FormControlLabel value="SMS" control={<Radio />} label="SMS" />
        </RadioGroup>
        <TextField
          label="Contacts (comma-separated)"
          value={contacts.join(',')}
          onChange={(e) => setContacts(e.target.value.split(','))}
          margin="normal"
          fullWidth
        />
        <TextField
          label="Policy Groups (comma-separated)"
          value={policyGroups.join(',')}
          onChange={(e) => setPolicyGroups(e.target.value.split(','))}
          margin="normal"
          fullWidth
        />
        {method !== "SMS" && (
          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            margin="normal"
            fullWidth
          />
        )}
        <TextField
          label="Content"
          value={content}
          onChange={handleContentChange}
          margin="normal"
          fullWidth
          multiline
          rows={4}
          inputProps={{ maxLength: 160 }}
        />
        <Typography textAlign={'right'} variant="body2" color={remainingCharacters < 1 ? '#ff4545' : 'textSecondary'}>
          {remainingCharacters} character(s) left
        </Typography>
        <Button variant="contained" color="primary" onClick={handleSubmit}>
          Send Notification
        </Button>
      </Paper>
    </Container>
  );
};

export default ManualAlertForm;
