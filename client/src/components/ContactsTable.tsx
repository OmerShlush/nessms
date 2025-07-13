/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Chip,
  Tooltip,
  Button,
  Alert,
  SelectChangeEvent
} from '@mui/material';
import DoneIcon from '@mui/icons-material/Done';
import { ContactCsvRow, IContact } from '../interfaces/contact.interface';
import { FilterChips } from './FilterChips';
import { FilterForm } from './FilterForm';
import ContactForm from './forms/ContactForm';
import DeleteForm from './forms/DeleteForm';
import { useUserContext } from './UserContext';
import { fetchWithAuth } from '../utilities/apiUtils';
import { saveAs } from 'file-saver'; // Import the file-saver library
import Papa from 'papaparse';

import exportIcon from '../assets/ExportIcon.png';
import importIcon from '../assets/ImportIcon.png';
import ImportModal from './forms/ImportForm';

interface IContactsTableProps {
  name: string;
  rows: IContact[];
  onUpdate?: () => void;
}


const ContactsTable = ({ name, rows, onUpdate }: IContactsTableProps) => {
  const { user } = useUserContext();
  const headers = Object.keys(rows[0] || {});
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedHeader, setSelectedHeader] = useState<string>('');
  const [filterValue, setFilterValue] = useState<string>('');
  const [filters, setFilters] = useState<{ header: string; value: string }[]>([]);

  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [selectedContactForEdit, setSelectedContactForEdit] = useState<IContact | undefined>();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItemForDelete, setSelectedItemForDelete] = useState<IContact | null>(null);

  const [successAlert, setSuccessAlert] = useState<string | boolean>(false);
  const [errorAlert, setErrorAlert] = useState<string | boolean>(false);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const handleOpenAddForm = () => {
    setIsAddFormOpen(true);
  };

  const handleOpenEditForm = (contact: IContact) => {
    setSelectedContactForEdit(contact);
    setIsEditFormOpen(true);
  };

  const handleSaveContact = async (contact: IContact, update?: boolean) => {
    if (update) {
      try {
        const response = await fetchWithAuth(`/contact/${contact.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(contact),
        });

        if (response.ok) {
          setSuccessAlert('Contact updated successfully!');
          if (onUpdate) {
            onUpdate();
          }
        } else {
          setErrorAlert('An error occurred while trying to update contact.');
        }
      } catch (error) {
        setErrorAlert('An error occurred while trying to update contact.');
      }
    } else {
      try {
        const response = await fetchWithAuth(`/contact/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(contact),
        });

        if (response.ok) {
          setSuccessAlert('Contact created successfully!');
          if (onUpdate) {
            onUpdate();
          }
        } else {
          setErrorAlert('An error occurred while trying to create contact.');
        }
      } catch (error) {
        setErrorAlert('An error occurred while trying to create contact.');
      }
    }
  };


  // Function to handle closing the forms
  const handleCloseForms = () => {
    setIsAddFormOpen(false);
    setIsEditFormOpen(false);
    setSelectedContactForEdit(undefined);
  };

  const handleOpenDeleteModal = (item: IContact) => {
    setSelectedItemForDelete(item);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setSelectedItemForDelete(null);
    setIsDeleteModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (selectedItemForDelete) {
      // Call your delete function here
      await handleDeleteContact(selectedItemForDelete);
      handleCloseDeleteModal();
    }
  };

  const handleDeleteContact = async (contact: IContact) => {
    try {
      // Send API request to delete the contact
      const response = await fetchWithAuth(`/contact/${contact.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccessAlert('Contact deleted successfully!')
        if (onUpdate) {
          onUpdate();
        }
      } else {
        setErrorAlert('An error occured while trying to delete contact.')
      }
    } catch (error) {
      setErrorAlert('An error occured while trying to delete contact.')
    }
  };

  const handleChangePage = (_event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: SelectChangeEvent<number>) => {
    const rows = Number(event.target.value);
    setRowsPerPage(rows);
    setPage(1);
  };

  const handleAddFilter = () => {
    if (selectedHeader && filterValue) {
      setFilters([...filters, { header: selectedHeader, value: filterValue }]);
      setSelectedHeader('');
      setFilterValue('');
      setPage(1);
    }
  };

  const handleDeleteFilter = (index: number) => {
    const updatedFilters = [...filters];
    updatedFilters.splice(index, 1);
    setFilters(updatedFilters);
    setPage(1);
  };

  const handleChangeFilterValue = (event: React.ChangeEvent<{ value: unknown }>) => {
    setFilterValue(event.target.value as string);
  };

  const handleExportToCSV = () => {
    const csvRows = [];
    const headers = Object.keys(filteredRows[0] || {});

    // Adding headers to the CSV rows
    csvRows.push(headers.map(header => `"${header}"`).join(','));

    // Adding data rows to the CSV
    filteredRows.forEach(row => {
      const rowData = headers.map(header => {
        if (header === 'schedule') {
          // Handling systems array by enclosing in double quotes
          return `"${JSON.stringify(row.schedule).replace(/"/g, '""')}"`;
        } else if (header === 'active') {
          return `"${JSON.stringify(row.active).replace(/"/g, '""')}"`;
        } else {
          return `"${String(row[header]).replace(/"/g, '""')}"`;
        }
      });
      csvRows.push(rowData.join(','));
    });

    // Creating a Blob with CSV content
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });

    // Using file-saver library to download the Blob as a CSV file
    saveAs(blob, 'contacts.csv');
  };

  const handleImportCSV = async (file: File) => {
    try {
      setIsImportModalOpen(false);
      const text = await file.text();

      // Parse the CSV data using PapaParse
      const { data } = Papa.parse<ContactCsvRow>(text, { header: true });

      // Process each data row and create the desired IContact objects
      const contacts: IContact[] = data
      .filter((row) => {
        return (
          row.name &&
          row.phone &&
          row.email &&
          row.groups &&
          row.active &&
          row.schedule
        );
      })
      .map((row) => {
        try {
          const groups = row.groups.split(',').map((group) => group.trim());
    
          const active = JSON.parse(row.active);
          const schedule = JSON.parse(row.schedule);
    
          return {
            name: row.name,
            phone: row.phone,
            email: row.email,
            groups: groups,
            active: {
              sms: active.sms || '',
              email: active.email || '',
            },
            schedule: {
              ...schedule,
              start_time: schedule.start_time || '',
              end_time: schedule.end_time || '',
            },
          };
        } catch (error) {
          console.error('Error parsing JSON for a contact:', error);
          // Skip the item if JSON parsing fails by returning undefined
        }
      })
      .filter((contact): contact is IContact => contact !== undefined);
    

      try {
        const response = await fetchWithAuth(`/contact/import`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(contacts),
        });

        if (response.ok) {
          setSuccessAlert('Contacts imported successfully!');
          if (onUpdate) {
            onUpdate();
          }
        } else {
          setErrorAlert('An error occurred while trying to import contacts.x');
        }
      } catch (error) {
        setErrorAlert('An error occurred while trying to import contacts.z');
      }
    } catch (error) {
      console.error('Error importing CSV:', error);
    }
  };




  const filteredRows = rows.filter((row) => {
    return filters.every((filter) => {
      const header = filter.header as keyof IContact;
      return String(row[header])
        .toLowerCase()
        .includes(filter.value.toLowerCase());
    });
  });

  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedRows = filteredRows.slice(startIndex, endIndex);

  return (
    <div>
      <div style={{ position: 'fixed', bottom: 0, left: 0, marginLeft: '10px', marginBottom: '10px' }}>
        {successAlert && (
          <Alert onClose={() => setSuccessAlert(false)} severity="success" sx={{ mt: 2 }}>
            {successAlert}
          </Alert>
        )}

        {errorAlert && (
          <Alert onClose={() => setErrorAlert(false)} severity="error" sx={{ mt: 2 }}>
            {errorAlert}
          </Alert>
        )}
      </div>

      <br />
      <FilterChips filters={filters} onDeleteFilter={handleDeleteFilter} />
      <FilterForm
        headers={['id', 'name', 'phone', 'email', 'groups']}
        selectedHeader={selectedHeader}
        filterValue={filterValue}
        onChangeHeader={(e: any) => setSelectedHeader(e.target.value as string)}
        onChangeFilterValue={handleChangeFilterValue}
        onAddFilter={handleAddFilter}
      />
      <br />
      {user?.role === 'admin' && <Button variant="contained" color="primary" onClick={handleOpenAddForm} style={{ marginBottom: '15px' }}>
        Add Contact
      </Button>}
      <Tooltip title="Export to CSV">
        <img
          src={exportIcon}
          alt="Export to CSV"
          style={{ margin: '0 0 15px 15px', cursor: 'pointer', width: '30px', height: '30px', float: 'right' }}
          onClick={handleExportToCSV}
        />
      </Tooltip>
      {user?.role === 'admin' &&
        <React.Fragment>
          <Tooltip title="Import CSV">
            <img
              src={importIcon}
              alt="Import CSV"
              style={{ margin: '0 0 15px 15px', cursor: 'pointer', width: '30px', height: '30px', float: 'right' }}
              onClick={() => setIsImportModalOpen(true)}
            />
          </Tooltip>
          <ImportModal
            open={isImportModalOpen}
            onClose={() => setIsImportModalOpen(false)}
            onImport={handleImportCSV} // Implement the import logic here
          />
        </React.Fragment>}
      <br />
      <FormControl variant="standard" style={{ float: 'right' }}>
        <InputLabel>Rows:</InputLabel>
        <Select
          labelId="rows-per-page-label"
          id="rows-per-page-select"
          value={rowsPerPage}
          onChange={handleChangeRowsPerPage}
        >
          <MenuItem value={10}>10</MenuItem>
          <MenuItem value={25}>25</MenuItem>
          <MenuItem value={50}>50</MenuItem>
        </Select>
      </FormControl>
      <Pagination
        count={Math.ceil(filteredRows.length / rowsPerPage)}
        page={page}
        onChange={handleChangePage}
      />
      <br />
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label={name}>
          <TableHead>
            <TableRow>
              {headers.map((header) => (
                <TableCell key={header}>
                  {(header.charAt(0).toUpperCase() + header.slice(1)).replace('_', ' ')}
                </TableCell>
              ))}
              {user?.role === 'admin' && <TableCell />}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.map((row: IContact, index: number) => (
              <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell>
                  <Tooltip title={row.id && row.id}>
                    <span>{row.id && row.id}</span>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Tooltip title={row.name && row.name}>
                    <span>{row.name && row.name}</span>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Tooltip title={row.phone && row.phone}>
                    <span>{row.phone && row.phone}</span>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Tooltip title={row.email && row.email}>
                    <span>{row.email && row.email}</span>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Tooltip title={row.groups && row.groups.join(', ')}>
                    <span>{row.groups && row.groups.join(', ')}</span>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  {row.active.sms && <Chip label="SMS" style={{ margin: '5px' }} icon={<DoneIcon />} />}
                  {row.active.email && <Chip label="Email" style={{ margin: '5px' }} icon={<DoneIcon />} />}
                </TableCell>
                <TableCell>
                  {row.schedule.sunday ? 'Sun ' : ''}
                  {row.schedule.monday ? 'Mon ' : ''}
                  {row.schedule.tuesday ? 'Tue ' : ''}
                  {row.schedule.wednesday ? 'Wed ' : ''}
                  {row.schedule.thursday ? 'Thu ' : ''}
                  {row.schedule.friday ? 'Fri ' : ''}
                  {row.schedule.saturday ? 'Sat ' : ''}
                  {`(${row.schedule.start_time && row.schedule.start_time} - ${row.schedule.end_time && row.schedule.end_time})`}
                </TableCell>
                {user?.role === 'admin' && <TableCell>
                  <Button onClick={() => handleOpenEditForm(row)}>Edit</Button>
                  <Button onClick={() => handleOpenDeleteModal(row)}>Delete</Button>
                </TableCell>}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <DeleteForm
        open={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        itemName="contact"
      />
      <ContactForm
        open={isAddFormOpen}
        onClose={handleCloseForms}
        onSave={handleSaveContact}
      />
      {isEditFormOpen && (
        <ContactForm
          open={isEditFormOpen}
          onClose={handleCloseForms}
          onSave={handleSaveContact}
          contact={selectedContactForEdit}
        />
      )}

    </div>
  );
};

export default ContactsTable;
