/* eslint-disable @typescript-eslint/no-explicit-any */
import { Stack, Chip } from '@mui/material';
export const FilterChips = ({ filters, onDeleteFilter }: any) => (
    <Stack direction="row" spacing={1} style={{ marginBottom: '16px', marginTop: '25px' }}>
      {filters.map((filter: any, index: number) => (
        <Chip
          key={index}
          label={`${filter.header}: ${filter.value}`}
          onDelete={() => onDeleteFilter(index)}
        />
      ))}
    </Stack>
  );