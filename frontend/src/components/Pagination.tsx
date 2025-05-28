import React from 'react';
import {
  TablePagination
} from '@mui/material';

interface PaginationProps {
  totalItems: number;
  page: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  totalItems,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange
}) => {
  return (
    <TablePagination
      component="div"
      count={totalItems}
      page={page}
      onPageChange={(_, newPage) => onPageChange(newPage)}
      rowsPerPage={rowsPerPage}
      onRowsPerPageChange={(event) => onRowsPerPageChange(parseInt(event.target.value, 10))}
      rowsPerPageOptions={[5, 10, 25, 50]}
    />
  );
}; 