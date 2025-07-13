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
  Tooltip,
  Button,
  Alert,
  SelectChangeEvent
} from '@mui/material';
import { FilterChips } from './FilterChips';
import { FilterForm } from './FilterForm';
import DeleteForm from './forms/DeleteForm';
import { useUserContext } from './UserContext';
import { IAccount } from '../interfaces/account.interface';
import AccountForm from './forms/AccountForm';
import { fetchWithAuth } from '../utilities/apiUtils';


interface IAccountsTableProps {
  name: string;
  rows: IAccount[];
  onUpdate?: () => void;
}


const AccountsTable = ({ name, rows, onUpdate }: IAccountsTableProps) => {
  const { user } = useUserContext();
  const headers = Object.keys(rows[0] || {});
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedHeader, setSelectedHeader] = useState<string>('');
  const [filterValue, setFilterValue] = useState<string>('');
  const [filters, setFilters] = useState<{ header: string; value: string }[]>([]);

  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [selectedAccountForEdit, setSelectedAccountForEdit] = useState<Partial<IAccount> | undefined>();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItemForDelete, setSelectedItemForDelete] = useState<Partial<IAccount> | null>(null);

  const [successAlert, setSuccessAlert] = useState<string | boolean>(false);
  const [errorAlert, setErrorAlert] = useState<string | boolean>(false);

  const handleOpenAddForm = () => {
    setIsAddFormOpen(true);
  };

  const handleOpenEditForm = (contact: Partial<IAccount>) => {
    setSelectedAccountForEdit(contact);
    setIsEditFormOpen(true);
  };

  const handleSaveAccount = async (account: Partial<IAccount>, update?: boolean) => {
    if (update) {
      try {
        const response = await fetchWithAuth(`/account/${account.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(account),
        });

        if (response.ok) {
          setSuccessAlert('Account updated successfully!');
          if (onUpdate) {
            onUpdate();
          }
        } else {
          setErrorAlert('An error occurred while trying to update account.');
        }
      } catch (error) {
        setErrorAlert('An error occurred while trying to update account.');
      }
    } else {
      try {
        const response = await fetchWithAuth(`/account/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(account),
        });

        if (response.ok) {
          setSuccessAlert('Account created successfully!');
          if (onUpdate) {
            onUpdate();
          }
        } else {
          setErrorAlert('An error occurred while trying to create account.');
        }
      } catch (error) {
        setErrorAlert('An error occurred while trying to create account.');
      }
    }
  };


  // Function to handle closing the forms
  const handleCloseForms = () => {
    setIsAddFormOpen(false);
    setIsEditFormOpen(false);
    setSelectedAccountForEdit(undefined);
  };

  const handleOpenDeleteModal = (item: Partial<IAccount>) => {
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
      await handleDeleteAccount(selectedItemForDelete);
      handleCloseDeleteModal();
    }
  };

  const handleDeleteAccount = async (account: Partial<IAccount>) => {
    try {
      // Send API request to delete the contact
      const response = await fetchWithAuth(`/account/${account.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccessAlert('Account deleted successfully!')
        if (onUpdate) {
          onUpdate();
        }
      } else {
        setErrorAlert('An error occured while trying to delete account.')
      }
    } catch (error) {
      setErrorAlert('An error occured while trying to delete account.')
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

  const filteredRows = rows.filter((row) => {
    return filters.every((filter) => {
      const header = filter.header as keyof IAccount;
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
        Add Account
      </Button>}
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
            {paginatedRows.map((row: Partial<IAccount>, index: number) => (
              <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell>
                  <Tooltip title={row.id && row.id}>
                    <span>{row.id && row.id}</span>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Tooltip title={row.username && row.username}>
                    <span>{row.username && row.username}</span>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Tooltip title={row.email && row.email}>
                    <span>{row.email && row.email}</span>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Tooltip title={row.role && row.role}>
                    <span>{row.role && row.role}</span>
                  </Tooltip>
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
        itemName="account"
      />
      <AccountForm
        open={isAddFormOpen}
        onClose={handleCloseForms}
        onSave={handleSaveAccount}
      />
      {isEditFormOpen && (
        <AccountForm
          open={isEditFormOpen}
          onClose={handleCloseForms}
          onSave={handleSaveAccount}
          account={selectedAccountForEdit}
        />
      )}

    </div>
  );
};

export default AccountsTable;
