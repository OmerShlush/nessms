/* eslint-disable @typescript-eslint/no-explicit-any */
import { MenuItem, Select, FormControl, TextField, InputLabel, Button, FormLabel } from '@mui/material';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export const FilterForm = ({ headers, selectedHeader, filterValue, onChangeHeader, onChangeFilterValue, onAddFilter, startDate, onStartDateChange, endDate, onEndDateChange }: any) => (
  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
    <FormControl variant="standard" style={{ marginRight: '16px', minWidth: '180px' }}>
      <InputLabel htmlFor="header-select">Field:</InputLabel>
      <Select
        labelId="header-select-label"
        id="header-select"
        value={selectedHeader}
        onChange={onChangeHeader}
      >
        <MenuItem value="">Select Field</MenuItem>
        {headers.map((header: string) => (
          <MenuItem key={header} value={header}>
            {(header.charAt(0).toUpperCase() + header.slice(1)).replace('_', ' ')}
          </MenuItem>
        ))}

      </Select>
    </FormControl>
    {selectedHeader === 'date' ? (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ marginRight: '16px' }}>
          <FormLabel style={{ marginRight: '5px' }}>Start Date:</FormLabel>
          <DatePicker
            selected={startDate}
            onChange={onStartDateChange}
            dateFormat="MM/dd/yyyy"
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={1}
            isClearable
          />
        </div>
        <div>
          <FormLabel style={{ marginRight: '5px' }}>End Date:</FormLabel>
          {/* <DatePicker
            selected={endDate}
            onChange={onEndDateChange}
            dateFormat="MM/dd/yyyy"
            isClearable
          /> */}
          <DatePicker
            selected={endDate}
            onChange={onEndDateChange}
            dateFormat="MM/dd/yyyy"
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={1}
            isClearable
          />
        </div>
      </div>
    ) : (
      <TextField
        label="Contains:"
        variant="standard"
        value={filterValue}
        onChange={onChangeFilterValue}
        style={{ marginRight: '16px' }}
      />
    )}
    <Button
      onClick={onAddFilter}
      style={{
        textTransform: 'none',
        marginLeft: '10px',
        borderRadius: '10px',
        border: '1px solid',
      }}
    >
      Add Filter
    </Button>
  </div>

);