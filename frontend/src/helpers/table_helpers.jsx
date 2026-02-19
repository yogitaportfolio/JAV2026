import React, { useState } from 'react';
import { Box, Button, Menu, MenuItem } from "@mui/material";
import { GridToolbarContainer, GridToolbarFilterButton, GridToolbarQuickFilter } from "@mui/x-data-grid";
import { useReactToPrint } from 'react-to-print';

export function CustomToolbar({ exportdata,componentRef,title = "Report" }) {
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [margins, setMargins] = useState({ top: 10, right: 5, bottom: 10, left: 5 });
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handlePrint = useReactToPrint({
    // content: () => {
    //   const printContainer = document.createElement('div');
    //   printContainer.innerHTML = `
    //     <div class="print-header">${title}</div>
    //     ${componentRef.current.innerHTML}
    //   `;
    //   return printContainer;
    // },
    content: () => {
    // Clone the original content
    const originalContent = componentRef.current;
    const clonedContent = originalContent.cloneNode(true);
    
    // Create title element
    const titleElement = document.createElement('div');
    titleElement.className = 'print-header';
    titleElement.textContent = title;
    
    // Create wrapper and insert title
    const wrapper = document.createElement('div');
    wrapper.appendChild(titleElement);
    wrapper.appendChild(clonedContent);
    
    return wrapper;
  },
    // content: () => componentRef.current,
      documentTitle: title,
    onAfterPrint: handleClose,
    pageStyle: `
    @page {
      size: A4;
      margin: ${margins.top}mm ${margins.right}mm ${margins.bottom}mm ${margins.left}mm !important;
    }
      @media print {
        @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
          background-color: transparent !important;
        }
        /* Hide toolbar elements */
        .MuiDataGrid-toolbarContainer,
        .MuiDataGrid-toolbarFilter,
        .MuiDataGrid-toolbarQuickFilter {
          display: none !important;
        }
          /* Hide footer */
      .MuiDataGrid-footerContainer,
      .MuiDataGrid-selectedRowCount,
      .MuiDataGrid-pagination {
        display: none !important;
      }
        /* Hide action columns 
        .MuiDataGrid-cell[data-field="actions"],
        .MuiDataGrid-columnHeader[data-field="actions"],
        .MuiDataGrid-cell--withRenderer[data-field="actions"] {
          display: none !important;
        }
          .MuiDataGrid-cell[data-field="action"],
        .MuiDataGrid-columnHeader[data-field="action"],
        .MuiDataGrid-cell--withRenderer[data-field="action"] {
          display: none !important;
        } */
        /* Alternative selectors for action columns */
        .MuiDataGrid-cell:last-child,
        .MuiDataGrid-columnHeader:last-child {
          display: none !important;
        }
        /* Print header */
        .print-header {
          display: block !important;
          text-align: center;
          margin-bottom: 20px;
          font-size: 1.17em;
          font-weight: bold;
        }
        /* Ensure full table width */
        .MuiDataGrid-root {
          width: 100% !important;
          max-width: none !important;
          overflow: visible !important;
        }
        /* Fix table layout for printing */
        .MuiDataGrid-root .MuiDataGrid-cell {
          white-space: normal !important;
          word-wrap: break-word !important;
          font-size: 12px !important;
          padding: 4px !important;
        }
        .MuiDataGrid-root .MuiDataGrid-columnHeader {
          font-size: 12px !important;
          font-weight: bold !important;
          padding: 4px !important;
        }
        .MuiDataGrid-root .MuiDataGrid-row {
          page-break-inside: avoid;
          min-height: auto !important;
        }
        .MuiDataGrid-root .MuiDataGrid-columnHeaders {
          display: table-header-group;
        }
        .MuiDataGrid-root .MuiDataGrid-virtualScrollerRenderZone {
          position: static !important;
          transform: none !important;
        }
        .MuiDataGrid-root .MuiDataGrid-virtualScrollerContent {
          height: auto !important;
          transform: none !important;
        }
        .MuiDataGrid-root .MuiDataGrid-virtualScroller {
          overflow: visible !important;
          height: auto !important;
        }
        .MuiDataGrid-root * {
          overflow: visible !important;
        }
        /* Ensure table fits on page */
        .MuiDataGrid-root .MuiDataGrid-main {
          overflow: visible !important;
        }
        .MuiDataGrid-root .MuiDataGrid-columnHeadersInner {
          overflow: visible !important;
        }
      }
    `,
  });


  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        p: 0.5,
        pb: 0,
      }}
    >
      <GridToolbarQuickFilter />
      <Box>
        <GridToolbarContainer>
          {/* <GridToolbarFilterButton /> */}
          <Button
          hidden={!exportdata}
            aria-controls={open ? 'export-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            onClick={handleClick}
            startIcon={<i className='bx bxs-download'></i>}
            // endIcon={<i className='bx bx-chevron-down'></i>}
          >

            Export
          </Button>
          <Menu
            id="export-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
          >
            <MenuItem onClick={()=>{exportdata();handleClose()}}>
              {/* <i className='bx bxs-download' style={{ marginRight: '8px' }}></i> */}
              Download CSV
            </MenuItem>
            <MenuItem onClick={()=>{handlePrint();handleClose()}}>
              {/* <i className='bx bxs-printer' style={{ marginRight: '8px' }}></i> */}
              Print
            </MenuItem>
          </Menu>
        </GridToolbarContainer>
      </Box>
    </Box>
  );
}

export function QuickSearchToolbar() {
  return (
    <GridToolbarContainer className="">
      <GridToolbarQuickFilter
        placeholder="Search..."
        variant="standard"
        size="small"
        className="ms-0"
        sx={{
          '& .MuiInputBase-root': {
            borderRadius: '8px',
            // backgroundColor: '#f8f9fa',
            '&:hover': {
              backgroundColor: '#fff',
            }
          }
        }}
      />
    </GridToolbarContainer>
  );
}
