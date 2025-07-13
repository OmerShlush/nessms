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
  SelectChangeEvent
} from '@mui/material';
import { FilterChips } from './FilterChips';
import { FilterForm } from './FilterForm';
import { IMessagesLog } from '../interfaces/messagesLog.interface';
import exportIcon from '../assets/ExportIcon.png';
import { saveAs } from 'file-saver'; // Import the file-saver library

interface IMessagesLogTableProps {
  name: string;
  rows: IMessagesLog[];
}


const MessagesLogTable = ({ name, rows }: IMessagesLogTableProps) => {
  const headers = Object.keys(rows[0] || {});
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedHeader, setSelectedHeader] = useState<string>('');
  const [filterValue, setFilterValue] = useState<string>('');
  const [filters, setFilters] = useState<{ header: string; value: string | (string | Date | null)[] }[]>([]);
  const [startDate, setStartDate] = useState<string | Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const handleStartDateChange = (date: Date | null) => {
    setStartDate(date);
    setPage(1);
  };

  const handleEndDateChange = (date: Date | null) => {
    setEndDate(date);
    setPage(1);
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
    if (selectedHeader && (filterValue || (startDate && endDate))) {
      setFilters([...filters, { header: selectedHeader, value: filterValue || [startDate, endDate] }]);
      setSelectedHeader('');
      setFilterValue('');
      setStartDate(null);
      setEndDate(null);
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
    const value = event.target.value as string;
    if (selectedHeader === 'date') {
      // Reset start and end dates when changing date filter value
      setStartDate(null);
      setEndDate(null);
    }
    setFilterValue(value);
  };

  const filteredRows = rows.filter((row) => {
    return filters.every((filter) => {
      const header = filter.header as keyof IMessagesLog;
      if (header === 'date') {
        // Handle date filtering
        const rowDate = new Date(parseInt(row.date));
        return (
          (!filter.value[0] || rowDate >= new Date(filter.value[0])) &&
          (!filter.value[1] || rowDate <= new Date(filter.value[1]))
        );
      }
      return String(row[header])
        .toLowerCase()
        .includes(
          typeof filter.value === 'string'
            ? filter.value.toLowerCase()
            : (filter.value as string[]).map(item => String(item).toLowerCase()).join('') // Join array elements into a single string
        );


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
        if (header === "date") {
          const date = new Date(parseInt(row[header]));
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          return `${day}/${month}/${year} ${hours}:${minutes}`;
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
    saveAs(blob, 'MessagesLog.csv');
  };

  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedRows = filteredRows.slice(startIndex, endIndex);

  function getColorBySeverity(severity: string) {
    switch (severity) {
      case 'Clear':
        return '#009900'; 
      case 'Major':
        return '#FF7700';
      case 'Warning':
        return '#1470FA';
      case 'Minor':
        return '#FFD700';
      case 'Information':
        return '#00C4F5';
      case 'Critical':
        return '#FF0000';
      default:
        return '#000000'; // Default to black for unknown severity
    }
  }

  return (
    <div>
      <br />
      <FilterChips filters={filters} onDeleteFilter={handleDeleteFilter} />
      <FilterForm
        headers={['id', 'alert_id', 'hostname', 'message', 'date', 'severity', 'method', 'addresses', 'policy_groups']}
        selectedHeader={selectedHeader}
        filterValue={filterValue}
        startDate={startDate}
        endDate={endDate}
        onChangeHeader={(e: any) => setSelectedHeader(e.target.value as string)}
        onChangeFilterValue={handleChangeFilterValue}
        onAddFilter={handleAddFilter}
        onStartDateChange={handleStartDateChange}
        onEndDateChange={handleEndDateChange}
      />
      <br />
      <Tooltip title="Export to CSV">
        <img
          src={exportIcon}
          alt="Export to CSV"
          style={{ margin: '0 0 15px 15px', cursor: 'pointer', width: '30px', height: '30px', float: 'right' }}
          onClick={handleExportToCSV}
        />
      </Tooltip>
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
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.map((row: IMessagesLog, index: number) => (
              <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell>
                  <Tooltip title={row.id && row.id}>
                    <span>{row.id && row.id}</span>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Tooltip title={row.alert_id && row.alert_id}>
                    <span>{row.alert_id && row.alert_id}</span>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Tooltip title={row.hostname && row.hostname}>
                    <span>{row.hostname && row.hostname}</span>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Tooltip title={row.message && row.message}>
                    <span>{row.message && row.message.length > 50 ? `${row.message.substring(0, 50)}...` : row.message}</span>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Tooltip title={row.date && new Date(parseInt(row.date)).toLocaleString()}>
                    <span>
                      {row.date && (() => {
                        const date = new Date(parseInt(row.date));
                        const day = String(date.getDate()).padStart(2, '0');
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const year = date.getFullYear();
                        const hours = String(date.getHours()).padStart(2, '0');
                        const minutes = String(date.getMinutes()).padStart(2, '0');
                        return `${day}/${month}/${year} ${hours}:${minutes}`;
                      })()}

                    </span>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Tooltip title={row.severity && row.severity}>
                    <span style={{ color: getColorBySeverity(row.severity), fontWeight: 'bold'}}>{row.severity && row.severity}</span>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Tooltip title={row.method && row.method}>
                    <span>{row.method && row.method}</span>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Tooltip title={row.addresses && row.addresses.join(', ')}>
                    <span>{row.addresses && row.addresses.join(', ').length > 50 ? `${row.addresses.join(', ').substring(0, 50)}...` : row.addresses.join(', ')}</span>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Tooltip title={row.policy_groups && row.policy_groups.join(', ')}>
                    <span>{row.policy_groups && row.policy_groups.join(', ').length > 50 ? `${row.policy_groups.join(', ').substring(0, 50)}...` : row.policy_groups.join(', ')}</span>
                  </Tooltip>
                </TableCell>
                {/* <TableCell>{row.policy_groups.join(', ')}</TableCell> */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default MessagesLogTable;
