import { useState, useEffect, useCallback } from 'react';
import {
  MtiLookupService,
  FieldSpecProviderService,
  InputNormalizerService,
  BitmapParserService,
  FieldsParserService,
  Iso8583ParserService,
  Iso8583ComparatorService,
} from './core';
import { useParseMessage, useCompareMessages, useFieldModal, useCopyToClipboard } from './hooks';
import { Header, ParseMode, CompareMode, FieldDetailModal } from './components';
import { samples } from './constants';

const specProvider = new FieldSpecProviderService();
const parser = new Iso8583ParserService(
  new MtiLookupService(),
  new InputNormalizerService(),
  new BitmapParserService(),
  new FieldsParserService(specProvider),
);
const comparator = new Iso8583ComparatorService(parser);

export default function App() {
  const [appMode, setAppMode] = useState<'parse' | 'compare'>('parse');

  const {
    rawMessage,
    setRawMessage,
    parsedData,
    parse,
    clear: clearParse,
  } = useParseMessage(parser);
  const { copyStatus, copy } = useCopyToClipboard();
  const { selectedField, openModal, closeModal } = useFieldModal();

  const {
    compareMessageA,
    setCompareMessageA,
    compareMessageB,
    setCompareMessageB,
    comparisonResult,
    compare,
    clear: clearCompare,
  } = useCompareMessages(comparator);

  const handleCopyJson = useCallback(() => {
    if (parsedData) copy(parsedData);
  }, [parsedData, copy]);

  const handleBitClick = useCallback(
    (bitNum: number) => openModal(bitNum, parsedData),
    [openModal, parsedData],
  );

  useEffect(() => {
    setRawMessage(samples.purchase);
    parse(samples.purchase);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <div className="glass-bg"></div>
      <div className="container">
        <Header appMode={appMode} onModeChange={setAppMode} />

        {appMode === 'compare' ? (
          <CompareMode
            messageA={compareMessageA}
            onMessageAChange={setCompareMessageA}
            messageB={compareMessageB}
            onMessageBChange={setCompareMessageB}
            onCompare={compare}
            onClear={clearCompare}
            result={comparisonResult}
          />
        ) : (
          <ParseMode
            rawMessage={rawMessage}
            onMessageChange={setRawMessage}
            parsedData={parsedData}
            onParse={() => parse()}
            onClear={clearParse}
            copyStatus={copyStatus}
            onCopyJson={handleCopyJson}
            onBitClick={handleBitClick}
          />
        )}

        <footer className="app-footer">
          <p>&copy; {new Date().getFullYear()} ISO 8583 Analyzer | by <a href="https://github.com/lazxdev" target="_blank" rel="noreferrer">Lazxdev</a></p>
        </footer>
      </div>

      {selectedField && (
        <FieldDetailModal field={selectedField} onClose={closeModal} />
      )}
    </>
  );
}
