/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Pagination from '@mui/material/Pagination';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

interface ITable {
  name?: string;
  rows: Record<string, any>[];
}

export default function DataTable(table: ITable) {
  const headers = Object.keys(table.rows[0] || {});
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedHeader, setSelectedHeader] = useState<string>('');
  const [filterValue, setFilterValue] = useState<string>('');
  const [filters, setFilters] = useState<{ header: string; value: string }[]>([]);

  const handleChangePage = (_event: React.ChangeEvent<unknown>, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: SelectChangeEvent<number>, ) => {
    const rows = Number(event.target.value);
    setRowsPerPage(rows);
    setPage(1); // Reset to the first page when changing rows per page
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

  // Function to recursively format nested objects
  const formatNestedObject = (obj: any): string => {
    if (typeof obj === 'object' && obj !== null) {
      if (Array.isArray(obj)) {
        return obj.map(formatNestedObject).join(', ');
      } else {
        return Object.entries(obj)
          .map(([key, val]) => {
            const formattedVal =
              typeof val === 'object' ? formatNestedObject(val) : String(val);
            return `${key}: ${formattedVal}`;
          })
          .join(', ');
      }
    }
    return obj !== null ? String(obj) : ''; // Return an empty string for null values
  };

  const renderCellValue = (header: string, value: any) => {
    if (header === 'date') {
      // Assuming value is a UNIX timestamp in milliseconds
      const date = new Date(value * 1); // Convert to milliseconds
      return date.toLocaleDateString(); // Format as a human-readable date string
    } else if (typeof value === 'object') {
      return formatNestedObject(value);
    }
    return String(value);
  };
  
  const getRenderedDate = (row: Record<string, any>, header: string) => {
    if (header === 'date') {
      // Assuming row[header] is a UNIX timestamp in milliseconds
      const date = new Date(row[header] * 1); // Convert to milliseconds
      return date.toLocaleDateString(); // Format as a human-readable date string
    }
    return String(row[header]); // Use the default value for other headers
  };

  const filteredRows = table.rows.filter((row) => {
    return filters.every(
      (filter) =>
        getRenderedDate(row, filter.header)
          .toLowerCase()
          .includes(filter.value.toLowerCase())
    );
  });

  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedRows = filteredRows.slice(startIndex, endIndex);

  return (
    <div>
      <br />
      <Stack direction="row" spacing={1} style={{ marginBottom: '16px' }}>
        {filters.map((filter, index) => (
          <Chip
            key={index}
            label={`${filter.header}: ${filter.value}`}
            onDelete={() => handleDeleteFilter(index)}
          />
        ))}
      </Stack>
      <FormControl variant="standard" style={{ float: 'left', marginRight: '16px', minWidth: '100px'}}>
        <InputLabel htmlFor="header-select">Field:</InputLabel>
        <Select
          labelId="header-select-label"
          id="header-select"
          value={selectedHeader}
          onChange={(e) => setSelectedHeader(e.target.value as string)}
        >
          <MenuItem value="">Select Field</MenuItem>
          {headers.map((header) => (
            <MenuItem key={header} value={header}>
              {header}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        label="Contains:"
        variant="standard"
        value={filterValue}
        onChange={handleChangeFilterValue}
        style={{ float: 'left', marginRight: '16px' }}
      />
      <Button onClick={handleAddFilter} style={{ marginTop:'20px', marginBottom: '50px', textTransform: 'none' }}>
        Add Filter
      </Button>
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
        <Table sx={{ minWidth: 650 }} aria-label={table.name}>
          <TableHead>
            <TableRow>
              {headers.map((header) => (
                <TableCell key={header}>{header}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedRows.map((row, index) => (
              <TableRow key={index} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                {headers.map((header) => (
                  <TableCell key={header}>{renderCellValue(header, row[header])}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
