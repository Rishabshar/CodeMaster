// src/components/CodeEditor.jsx - WITH SPECIAL CHARACTER PREVENTION

import Editor from '@monaco-editor/react';

const CodeEditor = ({ code, onChange, language, height = "500px" }) => {
  return (
    <div className="w-full h-[500px] bg-slate-900/95 border border-white/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-b border-white/10 px-6 py-3 flex-shrink-0">
        <span className="text-white font-mono font-semibold text-lg drop-shadow-md">
          editor.{language === 'cpp' ? 'cpp' : language}
        </span>
      </div>
      
      {/* Editor Container - FIXED HEIGHT */}
      <div className="flex-1 min-h-[450px] relative">
        <Editor
          height="100%"
          language={language}
          value={code}
          onChange={onChange}
          theme="vs-dark"
          className="!w-full !h-full"
          options={{
            minimap: { enabled: false },
            fontSize: 15,
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            padding: { top: 10, bottom: 10 },
            // ✅ PREVENT SPECIAL CHARACTERS
            formatOnPaste: false,                    // Disable auto-format on paste
            formatOnType: false,                     // Disable auto-format while typing
            'editor.smartBrackets': false,           // Disable smart brackets
            'editor.autoClosingBrackets': 'never',   // Don't auto-close brackets
            'editor.autoClosingQuotes': 'never',     // Don't auto-close quotes
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;