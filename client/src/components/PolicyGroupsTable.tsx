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
  Chip,
} from '@mui/material';
import { FilterChips } from './FilterChips';
import { FilterForm } from './FilterForm';
import { IPolicyGroup, IPolicyGroupCSVRow } from '../interfaces/policyGroup.interface';
import DeleteForm from './forms/DeleteForm';
import PolicyGroupForm from './forms/PolicyGroupForm';
import { useUserContext } from './UserContext';
import { saveAs } from 'file-saver'; // Import the file-saver library
import ImportModal from './forms/ImportForm';
import { fetchWithAuth } from '../utilities/apiUtils';
import Papa from 'papaparse';

import exportIcon from '../assets/ExportIcon.png';
import importIcon from '../assets/ImportIcon.png';
interface IPolicyGroupsTableProps {
  name: string;
  rows: IPolicyGroup[];
  onUpdate?: () => void;
}


const PolicyGroupsTable = ({ name, rows, onUpdate }: IPolicyGroupsTableProps) => {
  const { user } = useUserContext();
  const headers = Object.keys(rows[0] || {});
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedHeader, setSelectedHeader] = useState<string>('');
  const [filterValue, setFilterValue] = useState<string>('');
  const [filters, setFilters] = useState<{ header: string; value: string }[]>([]);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [selectedPolicyGroupForEdit, setSelectedPolicyGroupForEdit] = useState<IPolicyGroup | undefined>();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItemForDelete, setSelectedItemForDelete] = useState<IPolicyGroup | null>(null);

  const [successAlert, setSuccessAlert] = useState<string | boolean>(false);
  const [errorAlert, setErrorAlert] = useState<string | boolean>(false);

  const handleSavePolicyGroup = async (policyGroup: IPolicyGroup, update?: boolean) => {
    if (update) {
      try {
        const response = await fetchWithAuth(`/policy-group/${policyGroup.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(policyGroup),
        });

        if (response.ok) {
          setSuccessAlert('Policy group updated successfully!');
          if (onUpdate) {
            onUpdate();
          }
        } else {
          setErrorAlert('An error occurred while trying to update a policy group.');
        }
      } catch (error) {
        setErrorAlert('An error occurred while trying to update a policy group.');
      }
    } else {
      try {
        const response = await fetchWithAuth(`/policy-group/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(policyGroup),
        });

        if (response.ok) {
          setSuccessAlert('Policy group created successfully!');
          if (onUpdate) {
            onUpdate();
          }
        } else {
          setErrorAlert('An error occurred while trying to create a policy group.');
        }
      } catch (error) {
        setErrorAlert('An error occurred while trying to create a policy group.');
      }
    }
  };


  const handleCloseForms = () => {
    setIsAddFormOpen(false);
    setIsEditFormOpen(false);
    setSelectedPolicyGroupForEdit(undefined);
  };

  const handleOpenDeleteModal = (item: IPolicyGroup) => {
    setSelectedItemForDelete(item);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setSelectedItemForDelete(null);
    setIsDeleteModalOpen(false);
  };

  const handleOpenAddForm = () => {
    setIsAddFormOpen(true);
  };

  const handleOpenEditForm = (policyGroup: IPolicyGroup) => {
    setSelectedPolicyGroupForEdit(policyGroup);
    setIsEditFormOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedItemForDelete) {
      // Call your delete function here
      await handleDeletePolicyGroup(selectedItemForDelete);
      handleCloseDeleteModal();
    }
  };

  const handleDeletePolicyGroup = async (policyGroup: IPolicyGroup) => {
    try {
      const response = await fetchWithAuth(`/policy-group/${policyGroup.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccessAlert('Policy group deleted successfully!')
        if (onUpdate) {
          onUpdate();
        }
      } else {
        setErrorAlert('An error occured while trying to delete policy group.')
      }
    } catch (error) {
      setErrorAlert('An error occured while trying to delete policy group.')
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
      const header = filter.header as keyof IPolicyGroup;
      if (header === 'systems') {
        return row.systems.some((system) =>
          Object.values(system)
            .some((value) =>
              String(value)
                .toLowerCase()
                .includes(filter.value.toLowerCase())
            )
        );
      } else {
        return String(row[header])
          .toLowerCase()
          .includes(filter.value.toLowerCase());
      }
    });
  });

  const handleExportToCSV = () => {
    const csvRows = [];
    const headers = Object.keys(filteredRows[0] || {});

    // Adding headers to the CSV rows
    csvRows.push(headers.map(header => `"${header}"`).join(','));

    // Adding data rows to the CSV
    filteredRows.forEach(row => {
      const rowData = headers.map(header => {
        if (header === 'systems') {
          // Handling systems array by enclosing in double quotes
          return `"${JSON.stringify(row.systems).replace(/"/g, '""')}"`;
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
    saveAs(blob, 'policy_groups.csv');
  };


  const handleImportCSV = async (file: File, onUpdate?: () => void) => {
    try {
      setIsImportModalOpen(false);
      const text = await file.text();
  
      // Parse the CSV data using PapaParse
      const { data } = Papa.parse<IPolicyGroupCSVRow>(text, { header: true });
      // Process each data row and create the desired IPolicyGroup objects
      const policyGroups: IPolicyGroup[] = data.map((row) => ({
        name: row.name,
        systems: JSON.parse(row.systems.replace(/\\"/g, '"')),
      }));
  
      try {
        const response = await fetchWithAuth(`/policy-group/import`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(policyGroups),
        });
  
        if (response.ok) {
          setSuccessAlert('Policy groups imported successfully!');
          if (onUpdate) {
            onUpdate();
          }
        } else {
          setErrorAlert('An error occurred while trying to import policy groups.');
        }
      } catch (error) {
        setErrorAlert('An error occurred while trying to import policy groups.');
      }
    } catch (error) {
      console.error('Error importing CSV:', error);
    }
  };
  


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
        headers={['id', 'name', 'systems']}
        selectedHeader={selectedHeader}
        filterValue={filterValue}
        onChangeHeader={(e: any) => setSelectedHeader(e.target.value as string)}
        onChangeFilterValue={handleChangeFilterValue}
        onAddFilter={handleAddFilter}
      />
      <br />
      {user?.role === 'admin' && <Button variant="contained" color="primary" onClick={handleOpenAddForm} style={{ marginBottom: '15px' }}>
        Add Policy Group
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
            {paginatedRows.map((row: IPolicyGroup, index: number) => (
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
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {row.systems && row.systems.map((system, index) => {
                      const fields = [
                        { label: 'Hostname', value: system.hostname },
                        { label: 'Probe', value: system.probe },
                        { label: 'Source', value: system.source },
                        { label: 'Message', value: system.message },
                        { label: 'Subsys', value: system.subsys },
                        { label: 'User Tag 1', value: system.user_tag1 },
                        { label: 'User Tag 2', value: system.user_tag2 },
                        { label: 'Custom 1', value: system.custom_1 },
                        { label: 'Custom 2', value: system.custom_2 },
                        { label: 'Custom 3', value: system.custom_3 },
                        { label: 'Custom 4', value: system.custom_4 },
                        { label: 'Custom 5', value: system.custom_5 },
                        { label: 'SMS Severity', value: `${system.severity.sms.min} - ${system.severity.sms.max}`},
                        { label: 'Email Severity', value: `${system.severity.email.min} - ${system.severity.email.max}`}
                      ];

                      const formattedFields = fields
                        .filter(field => field.value !== null && field.value !== undefined)
                        .map(field => `${field.label}: ${field.value}`)
                        .join(', ');

                      return (
                        <Tooltip key={index} title={formattedFields}>
                          <Chip label={`${system.hostname || 'System ' + (index+1)}`} style={{ marginRight: '5px' }} />
                        </Tooltip>
                      );
                    })}
                  </div>
                </TableCell>
                {user?.role === 'admin' && <TableCell align='right'>
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
        itemName="policy group"
      />
      <PolicyGroupForm
        open={isAddFormOpen}
        onClose={handleCloseForms}
        onSave={handleSavePolicyGroup}
      />
      {isEditFormOpen && (
        <PolicyGroupForm
          open={isEditFormOpen}
          onClose={handleCloseForms}
          onSave={handleSavePolicyGroup}
          policyGroup={selectedPolicyGroupForEdit}
        />
      )}
    </div>
  );
};

export default PolicyGroupsTable;
