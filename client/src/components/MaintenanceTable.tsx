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
  Alert,
  Button,
  SelectChangeEvent,
} from '@mui/material';
import { FilterChips } from './FilterChips';
import { FilterForm } from './FilterForm';
import { IMaintenanceEvent } from '../interfaces/maintenance.interface.tsx';
import DeleteForm from './forms/DeleteForm';
import MaintenanceEventForm from './forms/MaintenanceEventForm.tsx';
import { useUserContext } from './UserContext';
import { saveAs } from 'file-saver';
import { fetchWithAuth } from '../utilities/apiUtils';

import exportIcon from '../assets/ExportIcon.png';

interface IMaintenanceEventsTableProps {
  name: string;
  rows: IMaintenanceEvent[];
  onUpdate?: () => void;
}

const MaintenanceEventsTable = ({ rows, onUpdate }: IMaintenanceEventsTableProps) => {
  const { user } = useUserContext();
  const headers = Object.keys(rows[0] || {});
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState<{ header: string; value: string }[]>([]);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [selectedEventForEdit, setSelectedEventForEdit] = useState<IMaintenanceEvent | undefined>();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItemForDelete, setSelectedItemForDelete] = useState<IMaintenanceEvent | null>(null);
  const [successAlert, setSuccessAlert] = useState<string | boolean>(false);
  const [errorAlert, setErrorAlert] = useState<string | boolean>(false);

  const handleSaveMaintenanceEvent = async (event: IMaintenanceEvent, update?: boolean) => {
    try {
      const url = update ? `/maintenance-event/${event.id}` : `/maintenance-event/create`;
      const method = update ? 'PUT' : 'POST';
      const response = await fetchWithAuth(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });

      if (response.ok) {
        setSuccessAlert(`Maintenance event ${update ? 'updated' : 'created'} successfully!`);
        onUpdate?.();
      } else {
        setErrorAlert('An error occurred while saving the maintenance event.');
      }
    } catch (error) {
      setErrorAlert('An error occurred while saving the maintenance event.');
    }
  };

  const handleDeleteMaintenanceEvent = async (event: IMaintenanceEvent) => {
    try {
      const response = await fetchWithAuth(`/maintenance-event/${event.id}`, { method: 'DELETE' });
      if (response.ok) {
        setSuccessAlert('Maintenance event deleted successfully!');
        onUpdate?.();
      } else {
        setErrorAlert('An error occurred while deleting the maintenance event.');
      }
    } catch (error) {
      setErrorAlert('An error occurred while deleting the maintenance event.');
    }
  };

  const handleChangePage = (_event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: SelectChangeEvent<number>) => {
    setRowsPerPage(Number(event.target.value));
    setPage(1);
  };

  const handleExportToCSV = () => {
    const csvRows = [Object.keys(rows[0] || {}).join(',')];
    rows.forEach((row) => {
      const rowData = Object.values(row).map((value) =>
        typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
      );
      csvRows.push(rowData.join(','));
    });
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, 'maintenance_events.csv');
  };

  const paginatedRows = rows.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <div>
      <div style={{ position: 'fixed', bottom: 0, left: 0, margin: '10px' }}>
        {successAlert && <Alert onClose={() => setSuccessAlert(false)} severity="success">{successAlert}</Alert>}
        {errorAlert && <Alert onClose={() => setErrorAlert(false)} severity="error">{errorAlert}</Alert>}
      </div>

      <FilterChips filters={filters} onDeleteFilter={(index: any) => setFilters(filters.filter((_, i) => i !== index))} />
      <FilterForm headers={headers} filters={filters} setFilters={setFilters} />

      {user?.role === 'admin' && <Button variant="contained" color="primary" onClick={() => setIsAddFormOpen(true)}>Add Maintenance Event</Button>}
      <br />
      <br />

      <Tooltip title="Export to CSV">
        <img src={exportIcon} alt="Export to CSV" style={{ cursor: 'pointer', width: 30, float: 'right' }} onClick={handleExportToCSV} />
      </Tooltip>

      <FormControl variant="standard" style={{ float: 'right' }}>
        <InputLabel>Rows:</InputLabel>
        <Select value={rowsPerPage} onChange={handleChangeRowsPerPage}>
          <MenuItem value={10}>10</MenuItem>
          <MenuItem value={25}>25</MenuItem>
          <MenuItem value={50}>50</MenuItem>
        </Select>
      </FormControl>

      <Pagination count={Math.ceil(rows.length / rowsPerPage)} page={page} onChange={handleChangePage} />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {headers.map((header) => <TableCell key={header}>{header.replace('_', ' ')}</TableCell>)}
              {user?.role === 'admin' && <TableCell />}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.map((row, index) => (
              <TableRow key={index}>
                {headers.map((header) => (
                  <TableCell key={header}>
                    <Tooltip title={String(row[header as keyof IMaintenanceEvent])}>
                      <span>{String(row[header as keyof IMaintenanceEvent])}</span>
                    </Tooltip>
                  </TableCell>
                ))}
                {user?.role === 'admin' && (
                  <TableCell align="right">
                    <Button onClick={() => { setSelectedEventForEdit(row); setIsEditFormOpen(true); }}>Edit</Button>
                    <Button onClick={() => { setSelectedItemForDelete(row); setIsDeleteModalOpen(true); }}>Delete</Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <DeleteForm open={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={() => selectedItemForDelete && handleDeleteMaintenanceEvent(selectedItemForDelete)} itemName="maintenance event" />
      <MaintenanceEventForm open={isAddFormOpen} onClose={() => setIsAddFormOpen(false)} onSave={handleSaveMaintenanceEvent} />
      {isEditFormOpen && <MaintenanceEventForm open={isEditFormOpen} onClose={() => setIsEditFormOpen(false)} onSave={handleSaveMaintenanceEvent} maintenanceEvent={selectedEventForEdit} />}
    </div>
  );
};

export default MaintenanceEventsTable;
