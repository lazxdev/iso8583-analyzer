document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const rawMessageInput = document.getElementById('raw-message');
  const clearBtn = document.getElementById('clear-btn');
  const parseBtn = document.getElementById('parse-btn');
  
  const mtiBreakdown = document.getElementById('mti-breakdown');
  const mtiBadge = document.getElementById('mti-badge');
  const mtiVersion = document.getElementById('mti-version');
  const mtiClass = document.getElementById('mti-class');
  const mtiFunc = document.getElementById('mti-func');
  const mtiOrigin = document.getElementById('mti-origin');

  const parseMetadata = document.getElementById('parse-metadata');
  const metaFormat = document.getElementById('meta-format');
  const metaHeader = document.getElementById('meta-header');
  const metaPbitmap = document.getElementById('meta-pbitmap');
  const metaSbitmap = document.getElementById('meta-sbitmap');

  const errorContainer = document.getElementById('error-container');
  const errorList = document.getElementById('error-list');

  const primaryBitmapGrid = document.getElementById('primary-bitmap-grid');
  const secondaryBitmapGrid = document.getElementById('secondary-bitmap-grid');
  const secondaryBitmapContainer = document.getElementById('secondary-bitmap-container');

  const fieldsTableBody = document.getElementById('fields-table-body');
  const jsonViewer = document.getElementById('json-viewer');
  const copyJsonBtn = document.getElementById('copy-json-btn');

  // Modal elements
  const fieldModal = document.getElementById('field-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalFieldTitle = document.getElementById('modal-field-title');
  const modalFieldName = document.getElementById('modal-field-name');
  const modalFieldType = document.getElementById('modal-field-type');
  const modalFieldLen = document.getElementById('modal-field-len');
  const modalFieldFormat = document.getElementById('modal-field-format');
  const modalFieldValue = document.getElementById('modal-field-value');

  // Active fields store (updated on parse)
  let parsedDataGlobal = null;

  // ISO Field description index for hover tooltips (standard fallback)
  const fieldDescriptions = {
    1: "Second Bitmap",
    2: "Primary Account Number (PAN)",
    3: "Processing Code",
    4: "Amount, Transaction",
    5: "Amount, Settlement",
    6: "Amount, Cardholder Billing",
    7: "Transmission Date & Time",
    8: "Amount, Cardholder Billing Fee",
    9: "Conversion Rate, Settlement",
    10: "Conversion Rate, Cardholder Billing",
    11: "Systems Trace Audit Number (STAN)",
    12: "Time, Local Transaction",
    13: "Date, Local Transaction",
    14: "Date, Expiration",
    15: "Date, Settlement",
    16: "Date, Conversion",
    17: "Date, Capture",
    18: "Merchant Type (MCC)",
    19: "Acquiring Institution Country Code",
    20: "PAN Extended, Country Code",
    21: "Forwarding Institution Country Code",
    22: "Point of Service Entry Mode",
    23: "Application PAN Sequence Number",
    24: "Function Code (NII)",
    25: "Point of Service Condition Code",
    26: "Point of Service Capture Code",
    27: "Authorizing Identification Response Length",
    28: "Amount, Transaction Fee",
    29: "Amount, Settlement Fee",
    30: "Amount, Transaction Processing Fee",
    31: "Amount, Settlement Processing Fee",
    32: "Acquiring Institution Identification Code",
    33: "Forwarding Institution Identification Code",
    34: "Primary Account Number, Extended",
    35: "Track 2 Data",
    36: "Track 3 Data",
    37: "Retrieval Reference Number",
    38: "Authorization Identification Response",
    39: "Response Code",
    40: "Service Restriction Code",
    41: "Card Acceptor Terminal Identification",
    42: "Card Acceptor Identification Code",
    43: "Card Acceptor Name/Location",
    44: "Additional Response Data",
    45: "Track 1 Data",
    46: "Additional Data - ISO",
    47: "Additional Data - National",
    48: "Additional Data - Private",
    49: "Currency Code, Transaction",
    50: "Currency Code, Settlement",
    51: "Currency Code, Cardholder Billing",
    52: "Personal Identification Number (PIN) Data",
    53: "Security Related Control Information",
    54: "Additional Amounts",
    55: "ICC Data - EMV",
    56: "Reserved ISO",
    57: "Reserved National",
    58: "Reserved Private",
    59: "Referrals",
    60: "Reserved Private",
    61: "Reserved Private",
    62: "Reserved Private",
    63: "Reserved Private",
    64: "Message Authentication Code (MAC)",
    65: "Secondary Bitmap",
    66: "Settlement Code",
    67: "Extended Payment Code",
    68: "Receiving Institution Country Code",
    69: "Settlement Institution Country Code",
    70: "Network Management Information Code",
    71: "Message Number",
    72: "Data Record",
    73: "Action Date",
    74: "Credits, Number",
    75: "Credits, Reversal Number",
    76: "Debits, Number",
    77: "Debits, Reversal Number",
    78: "Transfer, Number",
    79: "Transfer, Reversal Number",
    80: "Inquiries, Number",
    81: "Authorizations, Number",
    82: "Credits, Processing Fee Amount",
    83: "Credits, Transaction Fee Amount",
    84: "Debits, Processing Fee Amount",
    85: "Debits, Transaction Fee Amount",
    86: "Credits, Amount",
    87: "Credits, Reversal Amount",
    88: "Debits, Amount",
    89: "Debits, Reversal Amount",
    90: "Original Data Elements",
    91: "File Update Code",
    92: "File Security Code",
    93: "Response Indicator",
    94: "Service Indicator",
    95: "Replacement Amounts",
    96: "Message Security Code",
    97: "Amount, Net Settlement",
    98: "Payee",
    99: "Settlement Institution ID Code",
    100: "Receiving Institution ID Code",
    101: "File Name",
    102: "Account Identification 1",
    103: "Account Identification 2",
    104: "Transaction Description",
    105: "Reserved ISO",
    106: "Reserved ISO",
    107: "Reserved ISO",
    108: "Reserved ISO",
    109: "Reserved ISO",
    110: "Reserved ISO",
    111: "Reserved ISO",
    112: "Reserved National",
    113: "Reserved National",
    114: "Reserved National",
    115: "Reserved National",
    116: "Reserved National",
    117: "Reserved National",
    118: "Reserved National",
    119: "Reserved National",
    120: "Reserved Private",
    121: "Reserved Private",
    122: "Reserved Private",
    123: "Reserved Private",
    124: "Reserved Private",
    125: "Reserved Private",
    126: "Reserved Private",
    127: "Reserved Private",
    128: "Message Authentication Code (MAC)"
  };

  // Sample templates map
  const samples = {
    purchase: "02007210000108C0800016123456789012345600000000000001500006230854000000010806432109123456789012TERM0001MERCHANT1234567840",
    echo: "0800822000000000000004000000000000000623085400000002301",
    reversal: "0400F21000000000000000000040000000001612345678901234560000000000000150000623085500000003020000000106230854000000064321000000000000"
  };

  // Build static bitmap grids on startup
  function initGrids() {
    primaryBitmapGrid.innerHTML = '';
    secondaryBitmapGrid.innerHTML = '';

    // Primary grid (1 to 64)
    for (let i = 1; i <= 64; i++) {
      const cell = document.createElement('div');
      cell.className = 'bit-cell';
      cell.id = `bit-cell-${i}`;
      cell.setAttribute('data-bit', i);
      cell.textContent = i;
      primaryBitmapGrid.appendChild(cell);
    }

    // Secondary grid (65 to 128)
    for (let i = 65; i <= 128; i++) {
      const cell = document.createElement('div');
      cell.className = 'bit-cell';
      cell.id = `bit-cell-${i}`;
      cell.setAttribute('data-bit', i);
      cell.textContent = i;
      secondaryBitmapGrid.appendChild(cell);
    }
  }

  // Clear visual grids status
  function resetGrids() {
    document.querySelectorAll('.bit-cell').forEach(cell => {
      cell.className = 'bit-cell';
      // Remove any existing tooltips
      const tooltip = cell.querySelector('.tooltip');
      if (tooltip) tooltip.remove();
    });
    secondaryBitmapContainer.classList.add('hidden');
  }

  // Set up tab-switching listeners
  document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
      
      button.classList.add('active');
      const tabId = button.getAttribute('data-tab');
      document.getElementById(tabId).classList.add('active');
    });
  });

  // Sample loader buttons click
  document.querySelectorAll('.sample-btn').forEach(button => {
    button.addEventListener('click', () => {
      const sampleKey = button.getAttribute('data-sample');
      rawMessageInput.value = samples[sampleKey] || '';
      rawMessageInput.focus();
      // Auto parse
      parseBtn.click();
    });
  });

  // Clear button click
  clearBtn.addEventListener('click', () => {
    rawMessageInput.value = '';
    rawMessageInput.focus();
  });

  // Modal actions
  function openFieldModal(fieldNum, fieldData) {
    modalFieldTitle.textContent = `Field #${fieldNum} Information`;
    modalFieldName.textContent = fieldData.name;
    modalFieldType.textContent = fieldData.type;
    modalFieldLen.textContent = fieldData.length;
    modalFieldFormat.textContent = fieldData.format;
    modalFieldValue.value = fieldData.rawValue;
    fieldModal.classList.remove('hidden');
  }

  modalCloseBtn.addEventListener('click', () => {
    fieldModal.classList.add('hidden');
  });

  fieldModal.addEventListener('click', (e) => {
    if (e.target === fieldModal) {
      fieldModal.classList.add('hidden');
    }
  });

  // Parse Action
  parseBtn.addEventListener('click', async () => {
    const rawVal = rawMessageInput.value.trim();
    if (!rawVal) {
      alert('Please enter an ISO 8583 message string.');
      return;
    }

    parseBtn.disabled = true;
    parseBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin button-icon"></i> Parsing...';

    resetGrids();
    errorContainer.classList.add('hidden');
    errorList.innerHTML = '';
    mtiBreakdown.classList.add('hidden');
    parseMetadata.classList.add('hidden');
    jsonViewer.textContent = '{}';
    copyJsonBtn.disabled = true;
    
    // Set table body back to loading state
    fieldsTableBody.innerHTML = `
      <tr>
        <td colspan="6" class="no-data"><i class="fa-solid fa-spinner fa-spin"></i> Processing message...</td>
      </tr>
    `;

    try {
      const response = await fetch('/api/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: rawVal })
      });

      const result = await response.json();
      parsedDataGlobal = result;

      // Render parsed JSON
      jsonViewer.textContent = JSON.stringify(result, null, 2);
      copyJsonBtn.disabled = false;

      // Handle validation errors / warnings banner
      if (result.errors && result.errors.length > 0) {
        errorContainer.classList.remove('hidden');
        result.errors.forEach(err => {
          const li = document.createElement('li');
          li.textContent = err;
          errorList.appendChild(li);
        });
      }

      if (result.isValid || (result.mti && result.mti.value)) {
        // Display MTI Details
        mtiBreakdown.classList.remove('hidden');
        mtiBadge.textContent = result.mti.value;
        mtiVersion.textContent = result.mti.version;
        mtiClass.textContent = result.mti.class;
        mtiFunc.textContent = result.mti.function;
        mtiOrigin.textContent = result.mti.originator;

        // Display Metadata
        parseMetadata.classList.remove('hidden');
        metaFormat.textContent = result.inputFormat === 'hex_decoded' ? 'Hex-Encoded (Autodecoded)' : 'ASCII Plain Text';
        metaHeader.textContent = result.header || 'None';
        metaPbitmap.textContent = result.primaryBitmap.hex || '-';
        metaSbitmap.textContent = result.secondaryBitmap ? result.secondaryBitmap.hex : 'None (Only Primary Bitmap Active)';

        // Map visual Primary Bitmap
        if (result.primaryBitmap && result.primaryBitmap.binary) {
          const binary = result.primaryBitmap.binary;
          for (let i = 0; i < 64; i++) {
            const fieldNum = i + 1;
            const bitCell = document.getElementById(`bit-cell-${fieldNum}`);
            if (bitCell) {
              if (binary[i] === '1') {
                bitCell.classList.add('active-bit');
                
                // Append tooltip
                const tooltip = document.createElement('span');
                tooltip.className = 'tooltip';
                tooltip.textContent = fieldDescriptions[fieldNum] || 'Reserved';
                bitCell.appendChild(tooltip);

                // Click event
                bitCell.onclick = () => {
                  const fieldVal = result.fields[fieldNum] || {
                    name: fieldDescriptions[fieldNum] || 'Reserved',
                    type: fieldNum === 1 ? 'fixed' : 'unknown',
                    length: fieldNum === 1 ? 16 : 0,
                    format: fieldNum === 1 ? 'b' : 'unknown',
                    rawValue: fieldNum === 1 ? result.secondaryBitmap.hex : 'Not parsed / No data'
                  };
                  openFieldModal(fieldNum, fieldVal);
                };
              } else {
                bitCell.onclick = null;
              }
            }
          }
        }

        // Map visual Secondary Bitmap
        if (result.secondaryBitmap && result.secondaryBitmap.binary) {
          secondaryBitmapContainer.classList.remove('hidden');
          const binary = result.secondaryBitmap.binary;
          for (let i = 0; i < 64; i++) {
            const fieldNum = i + 65;
            const bitCell = document.getElementById(`bit-cell-${fieldNum}`);
            if (bitCell) {
              if (binary[i] === '1') {
                bitCell.classList.add('active-bit');

                // Append tooltip
                const tooltip = document.createElement('span');
                tooltip.className = 'tooltip';
                tooltip.textContent = fieldDescriptions[fieldNum] || 'Reserved';
                bitCell.appendChild(tooltip);

                // Click event
                bitCell.onclick = () => {
                  const fieldVal = result.fields[fieldNum] || {
                    name: fieldDescriptions[fieldNum] || 'Reserved',
                    type: 'unknown',
                    length: 0,
                    format: 'unknown',
                    rawValue: 'Not parsed / No data'
                  };
                  openFieldModal(fieldNum, fieldVal);
                };
              } else {
                bitCell.onclick = null;
              }
            }
          }
        }

        // Populate Fields Table
        const parsedFieldsKeys = Object.keys(result.fields).map(Number).sort((a, b) => a - b);
        if (parsedFieldsKeys.length > 0) {
          fieldsTableBody.innerHTML = '';
          parsedFieldsKeys.forEach(fieldNum => {
            const field = result.fields[fieldNum];
            const tr = document.createElement('tr');
            
            const badgeClass = field.type === 'fixed' ? 'type-fixed' : 'type-variable';
            
            tr.innerHTML = `
              <td class="field-num">#${field.fieldNumber}</td>
              <td style="font-weight: 500;">${field.name}</td>
              <td><span class="badge-field-type ${badgeClass}">${field.type}</span></td>
              <td>${field.length}</td>
              <td><span class="code-font" style="color: var(--accent);">${field.format}</span></td>
              <td class="field-val-cell code-font" title="${field.rawValue}">${field.rawValue}</td>
            `;

            tr.addEventListener('click', () => {
              openFieldModal(fieldNum, field);
            });

            fieldsTableBody.appendChild(tr);
          });
        } else {
          fieldsTableBody.innerHTML = `
            <tr>
              <td colspan="6" class="no-data">No active fields parsed (only MTI and Bitmap found).</td>
            </tr>
          `;
        }
      } else {
        fieldsTableBody.innerHTML = `
          <tr>
            <td colspan="6" class="no-data" style="color: var(--danger);">
              <i class="fa-solid fa-circle-exclamation"></i> Parsing failed. Check warnings/errors above.
            </td>
          </tr>
        `;
      }

    } catch (e) {
      console.error(e);
      errorContainer.classList.remove('hidden');
      const li = document.createElement('li');
      li.textContent = `Server Connection Error: ${e.message}`;
      errorList.appendChild(li);

      fieldsTableBody.innerHTML = `
        <tr>
          <td colspan="6" class="no-data" style="color: var(--danger);">
            <i class="fa-solid fa-circle-exclamation"></i> Failed to communicate with parser server.
          </td>
        </tr>
      `;
    } finally {
      parseBtn.disabled = false;
      parseBtn.innerHTML = '<i class="fa-solid fa-bolt button-icon"></i> Parse Message';
    }
  });

  // Copy JSON to clipboard
  copyJsonBtn.addEventListener('click', () => {
    if (!parsedDataGlobal) return;
    
    navigator.clipboard.writeText(JSON.stringify(parsedDataGlobal, null, 2))
      .then(() => {
        const origText = copyJsonBtn.innerHTML;
        copyJsonBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
        copyJsonBtn.classList.remove('btn-secondary');
        copyJsonBtn.classList.add('btn-primary');
        setTimeout(() => {
          copyJsonBtn.innerHTML = origText;
          copyJsonBtn.classList.remove('btn-primary');
          copyJsonBtn.classList.add('btn-secondary');
        }, 2000);
      })
      .catch(err => {
        alert('Could not copy text: ' + err.message);
      });
  });

  // Start initialization
  initGrids();

  // --- Compare UI elements ---
  const rawMessageA = document.getElementById('raw-message-a');
  const rawMessageB = document.getElementById('raw-message-b');
  const compareBtn = document.getElementById('compare-btn');
  const compareSummary = document.getElementById('compare-summary');
  const sharedCount = document.getElementById('shared-fields-count');
  const onlyACount = document.getElementById('only-a-count');
  const onlyBCount = document.getElementById('only-b-count');

  if (compareBtn) {
    compareBtn.addEventListener('click', async () => {
      const a = (rawMessageA && rawMessageA.value) ? rawMessageA.value.trim() : '';
      const b = (rawMessageB && rawMessageB.value) ? rawMessageB.value.trim() : '';
      if (!a || !b) {
        alert('Please provide both Message A and Message B to compare.');
        return;
      }

      compareBtn.disabled = true;
      compareBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin button-icon"></i> Comparing...';
      compareSummary?.classList.add('hidden');

      try {
        const resp = await fetch('/api/compare', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ a, b })
        });
        const data = await resp.json();
        // render visual comparison
        if (typeof renderVisualCompare === 'function') {
          try { renderVisualCompare(data); } catch (e) { console.error(e); }
        }

        if (compareSummary) {
          compareSummary.classList.remove('hidden');
          sharedCount.textContent = data.sharedFields.length;
          onlyACount.textContent = data.onlyInAFields.length;
          onlyBCount.textContent = data.onlyInBFields.length;
        }
      } catch (err) {
        alert(`Comparison failed: ${err.message}`);
      } finally {
        compareBtn.disabled = false;
        compareBtn.innerHTML = '<i class="fa-solid fa-arrows-rotate button-icon"></i> Compare Messages';
      }
    });
  }

  // --- Compare visual helpers ---
  // Build grids for compare visualizers
  function initCompareGrids() {
    const ids = ['a-primary-bitmap-grid','a-secondary-bitmap-grid','b-primary-bitmap-grid','b-secondary-bitmap-grid'];
    ids.forEach(id => {
      const container = document.getElementById(id);
      if (!container) return;
      container.innerHTML = '';
      for (let i = 0; i < 64; i++) {
        const cell = document.createElement('div');
        cell.className = 'bit-cell';
        const bitNum = id.includes('primary') ? (i + 1) : (i + 65);
        cell.id = `${id}-bit-${bitNum}`;
        cell.setAttribute('data-bit', bitNum);
        cell.textContent = bitNum;
        container.appendChild(cell);
      }
    });
  }

  function clearCompareVisual() {
    ['a-primary-bitmap-grid','a-secondary-bitmap-grid','b-primary-bitmap-grid','b-secondary-bitmap-grid'].forEach(id => {
      const container = document.getElementById(id);
      if (!container) return;
      container.querySelectorAll('.bit-cell').forEach(cell => {
        cell.className = 'bit-cell';
        const tooltip = cell.querySelector('.tooltip'); if (tooltip) tooltip.remove();
        cell.onclick = null;
      });
    });
    document.getElementById('a-secondary-container')?.classList.add('hidden');
    document.getElementById('b-secondary-container')?.classList.add('hidden');
  }

  function openCompareFieldModal(bitNum, aField, bField) {
    modalFieldTitle.textContent = `Field #${bitNum} Comparison`;
    modalFieldName.textContent = fieldDescriptions[bitNum] || 'Reserved';
    modalFieldType.textContent = `${aField?.type || '-'}  |  ${bField?.type || '-'}`;
    modalFieldLen.textContent = `${aField?.length ?? '-'}  |  ${bField?.length ?? '-'}`;
    modalFieldFormat.textContent = `${aField?.format || '-'}  |  ${bField?.format || '-'}`;
    const aRaw = aField ? `${aField.rawValue}` : '(no value)';
    const bRaw = bField ? `${bField.rawValue}` : '(no value)';
    modalFieldValue.value = `Message A:\n${aRaw}\n\nMessage B:\n${bRaw}`;
    fieldModal.classList.remove('hidden');
  }

  function renderVisualCompare(result) {
    initCompareGrids();
    clearCompareVisual();

    // Fill MTI and metadata A
    document.getElementById('a-mti-badge').textContent = result.a.mti.value || '-';
    document.getElementById('a-mti-version').textContent = result.a.mti.version || '-';
    document.getElementById('a-mti-class').textContent = result.a.mti.class || '-';
    document.getElementById('a-mti-func').textContent = result.a.mti.function || '-';
    document.getElementById('a-mti-origin').textContent = result.a.mti.originator || '-';
    document.getElementById('a-meta-format').textContent = result.a.inputFormat || '-';
    document.getElementById('a-meta-header').textContent = result.a.header || '-';
    document.getElementById('a-meta-pbitmap').textContent = result.a.primaryBitmap?.hex || '-';
    document.getElementById('a-meta-sbitmap').textContent = result.a.secondaryBitmap?.hex || 'None';

    // Fill MTI and metadata B
    document.getElementById('b-mti-badge').textContent = result.b.mti.value || '-';
    document.getElementById('b-mti-version').textContent = result.b.mti.version || '-';
    document.getElementById('b-mti-class').textContent = result.b.mti.class || '-';
    document.getElementById('b-mti-func').textContent = result.b.mti.function || '-';
    document.getElementById('b-mti-origin').textContent = result.b.mti.originator || '-';
    document.getElementById('b-meta-format').textContent = result.b.inputFormat || '-';
    document.getElementById('b-meta-header').textContent = result.b.header || '-';
    document.getElementById('b-meta-pbitmap').textContent = result.b.primaryBitmap?.hex || '-';
    document.getElementById('b-meta-sbitmap').textContent = result.b.secondaryBitmap?.hex || 'None';

    // Build presence sets
    const aActive = new Set([...(result.a.primaryBitmap?.activeFields || []), ...(result.a.secondaryBitmap?.activeFields || [])]);
    const bActive = new Set([...(result.b.primaryBitmap?.activeFields || []), ...(result.b.secondaryBitmap?.activeFields || [])]);

    // Ensure secondary containers visibility
    if ((result.a.secondaryBitmap && result.a.secondaryBitmap.activeFields && result.a.secondaryBitmap.activeFields.length>0) || (result.b.secondaryBitmap && result.b.secondaryBitmap.activeFields && result.b.secondaryBitmap.activeFields.length>0)) {
      document.getElementById('a-secondary-container')?.classList.remove('hidden');
      document.getElementById('b-secondary-container')?.classList.remove('hidden');
    }

    // Mark presence and attach click handlers for bits 1..128
    for (let bit = 1; bit <= 128; bit++) {
      const aId = bit <= 64 ? `a-primary-bitmap-grid-bit-${bit}` : `a-secondary-bitmap-grid-bit-${bit}`;
      const bId = bit <= 64 ? `b-primary-bitmap-grid-bit-${bit}` : `b-secondary-bitmap-grid-bit-${bit}`;
      const aEl = document.getElementById(aId);
      const bEl = document.getElementById(bId);
      const inA = aActive.has(bit);
      const inB = bActive.has(bit);
      if (aEl) {
        if (inA) aEl.classList.add('present-a');
        aEl.onclick = () => openCompareFieldModal(bit, result.a.fields?.[bit], result.b.fields?.[bit]);
        if (inA || inB) {
          const tt = document.createElement('span'); tt.className='tooltip'; tt.textContent = fieldDescriptions[bit] || 'Reserved';
          if (!aEl.querySelector('.tooltip')) aEl.appendChild(tt);
        }
      }
      if (bEl) {
        if (inB) bEl.classList.add('present-b');
        bEl.onclick = () => openCompareFieldModal(bit, result.a.fields?.[bit], result.b.fields?.[bit]);
        if (inA || inB) {
          const tt2 = document.createElement('span'); tt2.className='tooltip'; tt2.textContent = fieldDescriptions[bit] || 'Reserved';
          if (!bEl.querySelector('.tooltip')) bEl.appendChild(tt2);
        }
      }

      // comparison classes
      if (result.primaryBitmapComparison && bit <= 64) {
        if ((result.primaryBitmapComparison.commonBits || []).includes(bit)) {
          if (aEl) aEl.classList.add('common-bit');
          if (bEl) bEl.classList.add('common-bit');
        } else if ((result.primaryBitmapComparison.onlyInA || []).includes(bit)) {
          if (aEl) aEl.classList.add('only-a-bit');
        } else if ((result.primaryBitmapComparison.onlyInB || []).includes(bit)) {
          if (bEl) bEl.classList.add('only-b-bit');
        }
      }
      if (result.secondaryBitmapComparison && bit > 64) {
        if ((result.secondaryBitmapComparison.commonBits || []).includes(bit)) {
          if (aEl) aEl.classList.add('common-bit');
          if (bEl) bEl.classList.add('common-bit');
        } else if ((result.secondaryBitmapComparison.onlyInA || []).includes(bit)) {
          if (aEl) aEl.classList.add('only-a-bit');
        } else if ((result.secondaryBitmapComparison.onlyInB || []).includes(bit)) {
          if (bEl) bEl.classList.add('only-b-bit');
        }
      }
    }

    // add small helper tooltips text for any marked bits not already done
    document.querySelectorAll('.common-bit, .only-a-bit, .only-b-bit, .present-a, .present-b').forEach(el => {
      const bit = Number(el.getAttribute('data-bit'));
      if (!bit) return;
      const tooltip = el.querySelector('.tooltip');
      if (!tooltip) {
        const t = document.createElement('span');
        t.className = 'tooltip';
        t.textContent = fieldDescriptions[bit] || 'Reserved';
        el.appendChild(t);
      }
    });
  }
});
