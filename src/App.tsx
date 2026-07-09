import { useState, useEffect } from 'react';
import { Iso8583Service, ParsedIsoMessage } from './iso8583/iso8583.service';
import { compareIsoMessages, ComparisonResult } from './iso8583/comparator';
const parser = new Iso8583Service();
// Descriptions index for UI hover tooltips
const fieldDescriptions: Record<number, string> = {
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
const samples = {
  purchase: "02007210000108C0800016123456789012345600000000000001500006230854000000010806432109123456789012TERM0001MERCHANT1234567840",
  echo: "0800822000000000000004000000000000000623085400000002301",
  reversal: "0400F21000000000000000000040000000001612345678901234560000000000000150000623085500000003020000000106230854000000064321000000000000",
  custom: "SEND394*0200F23EC081BAE0F000000000420600008116922595987216956750999900000004640012051349369980731349361205300800001205541116069920020992259598735000000000000000000000000000000000000007VVcgNwzm8sW0020025638000009920010001ENZONA XETID             LA HABANA    CU840000840000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000016030000000519683200002013A07B338"
};
export default function App() {
  const [appMode, setAppMode] = useState<'parse' | 'compare'>('parse');
  const [rawMessage, setRawMessage] = useState('');
  const [parsedData, setParsedData] = useState<ParsedIsoMessage | null>(null);
  const [activeTab, setActiveTab] = useState<'visualizer' | 'fields' | 'json'>('visualizer');
  const [selectedField, setSelectedField] = useState<{ number: number; name: string; type: string; length: number; format: string; rawValue: string } | null>(null);
  const [copyStatus, setCopyStatus] = useState('Copy JSON');
  // Compare mode state
  const [compareMessageA, setCompareMessageA] = useState('');
  const [compareMessageB, setCompareMessageB] = useState('');
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const handleCompare = () => {
    const a = compareMessageA.trim();
    const b = compareMessageB.trim();
    if (!a || !b) {
      alert('Please enter both ISO 8583 messages to compare.');
      return;
    }
    const result = compareIsoMessages(a, b);
    setComparisonResult(result);
  };
  const handleClearCompare = () => {
    setCompareMessageA('');
    setCompareMessageB('');
    setComparisonResult(null);
  };
  const handleParse = (messageText: string = rawMessage) => {
    const text = messageText.trim();
    if (!text) {
      alert('Please enter an ISO 8583 message string.');
      return;
    }
    const result = parser.parseMessage(text);
    setParsedData(result);
  };
  const handleSampleClick = (key: keyof typeof samples) => {
    const val = samples[key];
    setRawMessage(val);
    handleParse(val);
  };
  const handleClear = () => {
    setRawMessage('');
    setParsedData(null);
  };
  const handleCopyJson = () => {
    if (!parsedData) return;
    navigator.clipboard.writeText(JSON.stringify(parsedData, null, 2))
      .then(() => {
        setCopyStatus('Copied!');
        setTimeout(() => setCopyStatus('Copy JSON'), 2000);
      })
      .catch((err) => {
        alert('Could not copy JSON: ' + err.message);
      });
  };
  const openBitModal = (bitNum: number) => {
    if (!parsedData) return;
    const field = parsedData.fields[bitNum];
    if (field) {
      setSelectedField({
        number: bitNum,
        name: field.name,
        type: field.type,
        length: field.length,
        format: field.format,
        rawValue: field.rawValue
      });
    } else {
      // Bit is active but has no parsed field data (e.g. secondary bitmap indicator bit 1)
      const name = fieldDescriptions[bitNum] || 'Reserved';
      const rawValue = bitNum === 1 && parsedData.secondaryBitmap
        ? parsedData.secondaryBitmap.hex
        : 'Not parsed / No data';
      setSelectedField({
        number: bitNum,
        name,
        type: bitNum === 1 ? 'fixed' : 'unknown',
        length: bitNum === 1 ? 16 : 0,
        format: bitNum === 1 ? 'b' : 'unknown',
        rawValue
      });
    }
  };
  // Auto-parse on load with purchase sample if empty
  useEffect(() => {
    setRawMessage(samples.purchase);
    const result = parser.parseMessage(samples.purchase);
    setParsedData(result);
  }, []);
  return (
    <>
      <div className="glass-bg"></div>
      <div className="container">
        {/* Header */}
        <header className="app-header">
          <div className="brand">
            <div className="logo-icon">
              <i className="fa-solid fa-microchip"></i>
            </div>
            <div className="brand-text">
              <h1>ISO 8583 <span className="accent-text">Analyzer</span></h1>
              <p className="subtitle">Decode financial transaction messages into structured JSON instantly</p>
            </div>
          </div>
          <div className="header-actions">
            {/* Mode Toggle */}
            <div className="mode-toggle">
              <button
                onClick={() => setAppMode('parse')}
                className={`mode-btn ${appMode === 'parse' ? 'active' : ''}`}
              >
                <i className="fa-solid fa-bolt"></i> Parse
              </button>
              <button
                onClick={() => setAppMode('compare')}
                className={`mode-btn ${appMode === 'compare' ? 'active' : ''}`}
              >
                <i className="fa-solid fa-code-compare"></i> Compare
              </button>
            </div>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="action-btn-link">
              <i className="fa-brands fa-github"></i>
            </a>
          </div>
        </header>
        {/* Main Workspace */}
        {appMode === 'compare' ? (
          /* ═══ COMPARE MODE ═══ */
          <main className="compare-layout">
            {/* Input Row */}
            <div className="compare-input-row">
              <div className="panel compare-input-panel">
                <div className="panel-header">
                  <h2><i className="fa-solid fa-a icon-accent"></i> Message A</h2>
                </div>
                <div className="panel-body">
                  <textarea
                    value={compareMessageA}
                    onChange={(e) => setCompareMessageA(e.target.value)}
                    placeholder="Paste first ISO 8583 message..."
                    rows={5}
                  />
                </div>
              </div>
              <div className="panel compare-input-panel">
                <div className="panel-header">
                  <h2><i className="fa-solid fa-b icon-accent"></i> Message B</h2>
                </div>
                <div className="panel-body">
                  <textarea
                    value={compareMessageB}
                    onChange={(e) => setCompareMessageB(e.target.value)}
                    placeholder="Paste second ISO 8583 message..."
                    rows={5}
                  />
                </div>
              </div>
            </div>
            <div className="compare-actions">
              <button onClick={handleCompare} className="btn btn-primary">
                <i className="fa-solid fa-code-compare"></i> Compare Messages
              </button>
              <button onClick={handleClearCompare} className="btn btn-secondary">
                <i className="fa-solid fa-xmark"></i> Clear
              </button>
            </div>
            {/* Comparison Results */}
            {comparisonResult && (
              <div className="compare-results">
                {/* MTI Summary */}
                <div className="compare-mti-row">
                  <div className={`mti-card ${comparisonResult.a.isValid ? '' : 'mti-card--error'}`}>
                    <div className="mti-card-header">
                      <span className="badge badge-mti">{comparisonResult.a.mti.value || '????'}</span>
                      <h3>Message A</h3>
                    </div>
                    <div className="mti-grid">
                      <div className="mti-field"><span className="mti-label">Class</span><span className="mti-val">{comparisonResult.a.mti.class}</span></div>
                      <div className="mti-field"><span className="mti-label">Function</span><span className="mti-val">{comparisonResult.a.mti.function}</span></div>
                      <div className="mti-field"><span className="mti-label">Fields</span><span className="mti-val">{comparisonResult.a.fieldsCount}</span></div>
                      <div className="mti-field"><span className="mti-label">Valid</span><span className="mti-val">{comparisonResult.a.isValid ? '✅ Yes' : '❌ No'}</span></div>
                    </div>
                  </div>
                  <div className={`mti-card ${comparisonResult.b.isValid ? '' : 'mti-card--error'}`}>
                    <div className="mti-card-header">
                      <span className="badge badge-mti">{comparisonResult.b.mti.value || '????'}</span>
                      <h3>Message B</h3>
                    </div>
                    <div className="mti-grid">
                      <div className="mti-field"><span className="mti-label">Class</span><span className="mti-val">{comparisonResult.b.mti.class}</span></div>
                      <div className="mti-field"><span className="mti-label">Function</span><span className="mti-val">{comparisonResult.b.mti.function}</span></div>
                      <div className="mti-field"><span className="mti-label">Fields</span><span className="mti-val">{comparisonResult.b.fieldsCount}</span></div>
                      <div className="mti-field"><span className="mti-label">Valid</span><span className="mti-val">{comparisonResult.b.isValid ? '✅ Yes' : '❌ No'}</span></div>
                    </div>
                  </div>
                </div>
                {/* Field Stats Summary */}
                <div className="panel">
                  <div className="panel-header">
                    <h2><i className="fa-solid fa-chart-bar icon-accent"></i> Field Comparison Summary</h2>
                  </div>
                  <div className="panel-body">
                    <div className="compare-stats">
                      <div className="compare-stat">
                        <span className="compare-stat-num" style={{ color: 'var(--primary)' }}>{comparisonResult.sharedFields.length}</span>
                        <span className="compare-stat-label">Shared Fields</span>
                      </div>
                      <div className="compare-stat">
                        <span className="compare-stat-num" style={{ color: '#60a5fa' }}>{comparisonResult.onlyInAFields.length}</span>
                        <span className="compare-stat-label">Only in A</span>
                      </div>
                      <div className="compare-stat">
                        <span className="compare-stat-num" style={{ color: '#34d399' }}>{comparisonResult.onlyInBFields.length}</span>
                        <span className="compare-stat-label">Only in B</span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Bitmap Visual Diff */}
                <div className="panel">
                  <div className="panel-header">
                    <h2><i className="fa-solid fa-table-cells-large icon-accent"></i> Primary Bitmap Diff</h2>
                    <div className="legend">
                      <span className="legend-item"><span className="dot" style={{ background: 'var(--primary)' }}></span> Both</span>
                      <span className="legend-item"><span className="dot" style={{ background: '#60a5fa' }}></span> Only A</span>
                      <span className="legend-item"><span className="dot" style={{ background: '#34d399' }}></span> Only B</span>
                    </div>
                  </div>
                  <div className="panel-body">
                    <div className="bitmap-grid">
                      {Array.from({ length: 64 }, (_, i) => {
                        const bitNum = i + 1;
                        const cmp = comparisonResult.primaryBitmapComparison;
                        const inBoth = cmp.commonBits.includes(bitNum);
                        const inA = cmp.onlyInA.includes(bitNum);
                        const inB = cmp.onlyInB.includes(bitNum);
                        let cls = 'bit-cell';
                        if (inBoth) cls += ' common-bit';
                        else if (inA) cls += ' only-a-bit';
                        else if (inB) cls += ' only-b-bit';
                        return (
                          <div key={bitNum} className={cls}>
                            {bitNum}
                            {(inBoth || inA || inB) && (
                              <span className="tooltip">{fieldDescriptions[bitNum] || 'Reserved'}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                {/* Secondary Bitmap Diff (if applicable) */}
                {comparisonResult.secondaryBitmapComparison && (
                  <div className="panel">
                    <div className="panel-header">
                      <h2><i className="fa-solid fa-table-cells-large icon-accent"></i> Secondary Bitmap Diff</h2>
                    </div>
                    <div className="panel-body">
                      <div className="bitmap-grid">
                        {Array.from({ length: 64 }, (_, i) => {
                          const bitNum = i + 65;
                          const cmp = comparisonResult.secondaryBitmapComparison!;
                          const inBoth = cmp.commonBits.includes(bitNum);
                          const inA = cmp.onlyInA.includes(bitNum);
                          const inB = cmp.onlyInB.includes(bitNum);
                          let cls = 'bit-cell';
                          if (inBoth) cls += ' common-bit';
                          else if (inA) cls += ' only-a-bit';
                          else if (inB) cls += ' only-b-bit';
                          return (
                            <div key={bitNum} className={cls}>
                              {bitNum}
                              {(inBoth || inA || inB) && (
                                <span className="tooltip">{fieldDescriptions[bitNum] || 'Reserved'}</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
                {/* Field-by-field diff table */}
                <div className="panel">
                  <div className="panel-header">
                    <h2><i className="fa-solid fa-list-ul icon-accent"></i> Field Details Comparison</h2>
                  </div>
                  <div className="panel-body">
                    <div className="fields-table-wrapper">
                      <table className="fields-table">
                        <thead>
                          <tr>
                            <th>Bit</th>
                            <th>Field Name</th>
                            <th>Present</th>
                            <th>Value A</th>
                            <th>Value B</th>
                            <th>Match</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(() => {
                            const allFields = new Set([
                              ...comparisonResult.sharedFields,
                              ...comparisonResult.onlyInAFields,
                              ...comparisonResult.onlyInBFields,
                            ]);
                            const sorted = [...allFields].sort((a, b) => a - b);
                            return sorted.map((fNum) => {
                              const fieldA = comparisonResult.a.fields[fNum];
                              const fieldB = comparisonResult.b.fields[fNum];
                              const inBoth = fieldA && fieldB;
                              const valMatch = inBoth && fieldA.rawValue === fieldB.rawValue;
                              let presence = 'A & B';
                              let presenceColor = 'var(--primary)';
                              if (!fieldB) { presence = 'Only A'; presenceColor = '#60a5fa'; }
                              if (!fieldA) { presence = 'Only B'; presenceColor = '#34d399'; }
                              return (
                                <tr key={fNum}>
                                  <td className="field-num">#{fNum}</td>
                                  <td style={{ fontWeight: 500 }}>{fieldA?.name || fieldB?.name || fieldDescriptions[fNum] || 'Unknown'}</td>
                                  <td><span style={{ color: presenceColor, fontWeight: 600 }}>{presence}</span></td>
                                  <td className="field-val-cell code-font">{fieldA?.rawValue ?? '—'}</td>
                                  <td className="field-val-cell code-font">{fieldB?.rawValue ?? '—'}</td>
                                  <td>
                                    {inBoth ? (
                                      valMatch
                                        ? <span style={{ color: 'var(--success)' }}>✓ Same</span>
                                        : <span style={{ color: '#f59e0b' }}>✗ Different</span>
                                    ) : (
                                      <span style={{ color: 'var(--text-muted)' }}>—</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            });
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        ) : (
          /* ═══ PARSE MODE ═══ */
        <main className="dashboard-grid">
          {/* Left Column: Input and Controls */}
          <section className="panel control-panel">
            <div className="panel-header">
              <h2><i className="fa-solid fa-keyboard icon-accent"></i> Input ISO Message</h2>
            </div>
            <div className="panel-body">
              <div className="textarea-container">
                <textarea
                  value={rawMessage}
                  onChange={(e) => setRawMessage(e.target.value)}
                  placeholder="Paste your ISO 8583 message (ASCII string or hex dump)..."
                  rows={6}
                />
                {rawMessage && (
                  <button onClick={handleClear} className="icon-btn-inline" title="Clear message">
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                )}
              </div>
              <div className="action-row">
                <button onClick={() => handleParse()} className="btn btn-primary btn-block">
                  <i className="fa-solid fa-bolt button-icon"></i> Parse Message
                </button>
              </div>
              <div className="samples-section">
                <h3><i className="fa-solid fa-list-check"></i> Sample Templates</h3>
                <div className="sample-buttons">
                  <button onClick={() => handleSampleClick('purchase')} className="sample-btn">
                    <span className="sample-mti">0200</span>
                    <span className="sample-desc">Purchase Request</span>
                  </button>
                  <button onClick={() => handleSampleClick('echo')} className="sample-btn">
                    <span className="sample-mti">0800</span>
                    <span className="sample-desc">Network Echo</span>
                  </button>
                  <button onClick={() => handleSampleClick('reversal')} className="sample-btn">
                    <span className="sample-mti">0400</span>
                    <span className="sample-desc">Reversal Request</span>
                  </button>
                </div>
              </div>
              {/* MTI Decode Card */}
              {parsedData && parsedData.mti && parsedData.mti.value && (
                <div className="mti-card">
                  <div className="mti-card-header">
                    <span className="badge badge-mti">{parsedData.mti.value}</span>
                    <h3>MTI Details</h3>
                  </div>
                  <div className="mti-grid">
                    <div className="mti-field">
                      <span className="mti-label">ISO Version</span>
                      <span className="mti-val">{parsedData.mti.version}</span>
                    </div>
                    <div className="mti-field">
                      <span className="mti-label">Message Class</span>
                      <span className="mti-val">{parsedData.mti.class}</span>
                    </div>
                    <div className="mti-field">
                      <span className="mti-label">Message Function</span>
                      <span className="mti-val">{parsedData.mti.function}</span>
                    </div>
                    <div className="mti-field">
                      <span className="mti-label">Originator</span>
                      <span className="mti-val">{parsedData.mti.originator}</span>
                    </div>
                  </div>
                </div>
              )}
              {/* Parse Metadata Card */}
              {parsedData && (
                <div className="metadata-card">
                  <h3>Message Metadata</h3>
                  <ul>
                    <li>
                      <strong>Input Format:</strong>
                      <span>{parsedData.inputFormat === 'hex_decoded' ? 'Hex-Encoded (Autodecoded)' : 'ASCII Plain Text'}</span>
                    </li>
                    <li>
                      <strong>ISO Header:</strong>
                      <span>{parsedData.header || 'None'}</span>
                    </li>
                    <li>
                      <strong>Primary Bitmap (Hex):</strong>
                      <span className="code-font">{parsedData.primaryBitmap.hex || '-'}</span>
                    </li>
                    <li>
                      <strong>Secondary Bitmap (Hex):</strong>
                      <span className="code-font">{parsedData.secondaryBitmap ? parsedData.secondaryBitmap.hex : 'None (Only Primary Bitmap Active)'}</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </section>
          {/* Right Column: Visualizer, Table, JSON */}
          <section className="panel results-panel">
            <div className="tabs">
              <button
                onClick={() => setActiveTab('visualizer')}
                className={`tab-btn ${activeTab === 'visualizer' ? 'active' : ''}`}
              >
                <i className="fa-solid fa-table-cells-large"></i> Bitmap Visualizer
              </button>
              <button
                onClick={() => setActiveTab('fields')}
                className={`tab-btn ${activeTab === 'fields' ? 'active' : ''}`}
              >
                <i className="fa-solid fa-list-ul"></i> Parsed Fields
              </button>
              <button
                onClick={() => setActiveTab('json')}
                className={`tab-btn ${activeTab === 'json' ? 'active' : ''}`}
              >
                <i className="fa-solid fa-code"></i> JSON Output
              </button>
            </div>
            <div className="panel-body tab-content-wrapper">
              {/* Warnings and Errors Banner */}
              {parsedData && parsedData.errors && parsedData.errors.length > 0 && (
                <div className="error-banner">
                  <div className="error-banner-header">
                    <i className="fa-solid fa-triangle-exclamation"></i>
                    <h4>Parsing Warnings / Errors</h4>
                  </div>
                  <ul>
                    {parsedData.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}
              {/* Tab 1: Bitmap Visualizer */}
              <div className={`tab-content ${activeTab === 'visualizer' ? 'active' : ''}`}>
                <div className="bitmap-container">
                  <div className="bitmap-header-row">
                    <h3>Primary Bitmap Fields (1 - 64)</h3>
                    <div className="legend">
                      <span className="legend-item"><span className="dot active"></span> Active</span>
                      <span className="legend-item"><span className="dot inactive"></span> Inactive</span>
                    </div>
                  </div>
                  <div className="bitmap-grid">
                    {Array.from({ length: 64 }, (_, i) => {
                      const bitNum = i + 1;
                      const isActive = parsedData && parsedData.primaryBitmap.binary[i] === '1';
                      return (
                        <div
                          key={bitNum}
                          onClick={() => isActive && openBitModal(bitNum)}
                          className={`bit-cell ${isActive ? 'active-bit' : ''}`}
                        >
                          {bitNum}
                          {isActive && (
                            <span className="tooltip">{fieldDescriptions[bitNum] || 'Reserved'}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                {parsedData && parsedData.secondaryBitmap && (
                  <div className="bitmap-container">
                    <div className="bitmap-header-row border-top">
                      <h3>Secondary Bitmap Fields (65 - 128)</h3>
                    </div>
                    <div className="bitmap-grid">
                      {Array.from({ length: 64 }, (_, i) => {
                        const bitNum = i + 65;
                        const isActive = parsedData && parsedData.secondaryBitmap && parsedData.secondaryBitmap.binary[i] === '1';
                        return (
                          <div
                            key={bitNum}
                            onClick={() => isActive && openBitModal(bitNum)}
                            className={`bit-cell ${isActive ? 'active-bit' : ''}`}
                          >
                            {bitNum}
                            {isActive && (
                              <span className="tooltip">{fieldDescriptions[bitNum] || 'Reserved'}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                <div className="info-card">
                  <i className="fa-solid fa-info-circle"></i>
                  <p>Hover over any active bit in the grid above to view the field name. Click on it to view details.</p>
                </div>
              </div>
              {/* Tab 2: Parsed Fields Table */}
              <div className={`tab-content ${activeTab === 'fields' ? 'active' : ''}`}>
                <div className="fields-table-wrapper">
                  <table className="fields-table">
                    <thead>
                      <tr>
                        <th>Bit</th>
                        <th>Field Name</th>
                        <th>Type</th>
                        <th>Length</th>
                        <th>Format</th>
                        <th>Raw Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedData && Object.keys(parsedData.fields).length > 0 ? (
                        Object.keys(parsedData.fields)
                          .map(Number)
                          .sort((a, b) => a - b)
                          .map((fieldNum) => {
                            const field = parsedData.fields[fieldNum];
                            const badgeClass = field.type === 'fixed' ? 'type-fixed' : 'type-variable';
                            return (
                              <tr
                                key={fieldNum}
                                onClick={() => openBitModal(fieldNum)}
                              >
                                <td className="field-num">#{field.fieldNumber}</td>
                                <td style={{ fontWeight: 500 }}>{field.name}</td>
                                <td><span className={`badge-field-type ${badgeClass}`}>{field.type}</span></td>
                                <td>{field.length}</td>
                                <td><span className="code-font" style={{ color: 'var(--accent)' }}>{field.format}</span></td>
                                <td className="field-val-cell code-font" title={field.rawValue}>{field.rawValue}</td>
                              </tr>
                            );
                          })
                      ) : (
                        <tr>
                          <td colSpan={6} className="no-data">
                            No parsed fields. Input an ISO message and click parse.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              {/* Tab 3: JSON Output */}
              <div className={`tab-content ${activeTab === 'json' ? 'active' : ''}`}>
                <div className="code-viewer-container">
                  <div className="code-header">
                    <span><i className="fa-solid fa-code"></i> parsed_message.json</span>
                    <button
                      onClick={handleCopyJson}
                      disabled={!parsedData}
                      className="btn btn-secondary btn-sm"
                    >
                      <i className="fa-solid fa-copy"></i> {copyStatus}
                    </button>
                  </div>
                  <pre>
                    <code className="code-font">
                      {parsedData ? JSON.stringify(parsedData, null, 2) : '{}'}
                    </code>
                  </pre>
                </div>
              </div>
            </div>
          </section>
        </main>
        )}
        {/* Footer */}
        <footer className="app-footer">
          <p>&copy; 2026 ISO 8583 Analyzer. Built with React & Vite.</p>
        </footer>
      </div>
      {/* Detail Dialog / Modal for Fields */}
      {selectedField && (
        <div className="modal-overlay" onClick={() => setSelectedField(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Field #{selectedField.number} Details</h3>
              <button onClick={() => setSelectedField(null)} className="modal-close">&times;</button>
            </div>
            <div className="modal-body">
              <div className="modal-grid">
                <div className="modal-item">
                  <span className="modal-label">Name</span>
                  <span className="modal-val">{selectedField.name}</span>
                </div>
                <div className="modal-item">
                  <span className="modal-label">Spec Type</span>
                  <span className="modal-val">{selectedField.type.toUpperCase()}</span>
                </div>
                <div className="modal-item">
                  <span className="modal-label">Length</span>
                  <span className="modal-val">{selectedField.length}</span>
                </div>
                <div className="modal-item">
                  <span className="modal-label">Format</span>
                  <span className="modal-val">{selectedField.format}</span>
                </div>
              </div>
              <div className="modal-raw-section">
                <span className="modal-label">Value</span>
                <textarea
                  readOnly
                  rows={4}
                  className="code-font"
                  value={selectedField.rawValue}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
