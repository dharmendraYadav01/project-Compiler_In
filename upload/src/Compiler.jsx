import React, { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import './Compilerstyle.css';
import profile from './pics/profile.png';
import copy from './pics/copy.png';
import terminal from './pics/terminal.png';
import newlogo3 from './pics/newlogo3.png';
import finale from './pics/finale.png';
import refresh from './pics/refresh.png';
import format from './pics/format.png';
import light from './pics/light_mode.png';
import dark from './pics/dark_mode.png';
import { SiRobotframework } from "react-icons/si";
import { IoCloseOutline } from "react-icons/io5";
import { IoMdSend } from 'react-icons/io';

const codeSnippets = {
  'Javascript': `// Javascript
console.log("Hello, World!");`,
  'C++': `// C++
#include <iostream>
using namespace std;
int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,
  'C': `// C
#include <stdio.h>
int main() {
    printf("Hello, World!");
    return 0;
}`,
  'Java': `// Java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
  'Python': `# Python
print("Hello, World!")`
};

const judge0LangId = {
  Javascript: 63,
  "C++": 54,
  C: 50,
  Java: 62,
  Python: 71
};

const DUMMY_FILES = ['file1.js', 'file2.cpp', 'file3.c', 'file4.java', 'file5.py'];

export default function Compiler() {
  const [selectedLanguage, setSelectedLanguage] = useState('Javascript');
  const [code, setCode] = useState(codeSnippets['Javascript']);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [istheme, setIstheme] = useState(false);
  const [isAIModeOpen, setIsAIModeOpen] = useState(false);
  const [stdinValue, setStdinValue] = useState('');
  const textareaRef = useRef(null);

  const FILE_PANEL_WIDTH = 256;
  const AI_PANEL_WIDTH = 384;

  const languageMap = {
    JavaScript: 'javascript',
    'C++': 'cpp',
    C: 'c',
    Java: 'java',
    Python: 'python'
  };

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setSelectedLanguage(newLang);
    setCode(codeSnippets[newLang]);
  };

  const handleEditorDidMount = (editor, monaco) => {
    monaco.editor.defineTheme('my-custom-theme', {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#21252b',
        'editorGutter.background': '#21252b'
      }
    });
    monaco.editor.setTheme('my-custom-theme');
  };

  const handleRun = async () => {
  setIsRunning(true);
  setOutput(prev => prev + '\n⏳ Submitting to Judge0...\n');

  try {
    const response = await fetch("https://ce.judge0.com/submissions/?base64_encoded=false&wait=true", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source_code: code,
        language_id: judge0LangId[selectedLanguage],
        stdin: output.trim()  // ✅ terminal content = input
      })
    });

    const data = await response.json();

    if (data.compile_output) {
      setOutput(`❌ Compile Error:\n${data.compile_output}`);
    } else if (data.stderr) {
      setOutput(`⚠️ Runtime Error:\n${data.stderr}`);
    } else if (data.stdout) {
      setOutput(`✅ Output:\n${data.stdout}`);
    } else {
      setOutput("No output received.");
    }
  } catch (error) {
    setOutput(`Error: ${error.message}`);
  } finally {
    setIsRunning(false);
  }
};


  const handleClearOutput = () => setOutput('');
  const toggleAIMode = () => setIsAIModeOpen(p => !p);
  const handleLoginToggle = () => setIsLoggedIn(p => !p);
  const theme = () => setIstheme(p => !p);

  const mainContentWidth = isAIModeOpen
    ? `calc(100% - ${FILE_PANEL_WIDTH}px - ${AI_PANEL_WIDTH}px - 8px)`
    : `calc(100% - ${FILE_PANEL_WIDTH}px - 8px)`;

  return (
    <div className="app-container">
      {/* ---------------- HEADER ---------------- */}
      <header>
        <div className="left-header">
          <span className="left">
            <img className='imglogo-style' src={newlogo3} alt="logo" />&nbsp;
            <img className='img-logo' src={finale} alt="finale" />
          </span>
        </div>

        <div className="right-header" style={{ display: 'flex', alignItems: 'center', gap: '15px', marginRight: '10px' }}>
          {/* Theme */}
          {istheme ? (
            <button className='button2' title='Theme' onClick={theme}>
              <img className='setting' src={dark} alt="dark" />
            </button>
          ) : (
            <button className='button2' title='Theme' onClick={theme}>
              <img className='setting' src={light} alt="light" />
            </button>
          )}

          {/* AI Mode */}
          <button className='button2' title='AI Mode' onClick={toggleAIMode}>
            <SiRobotframework title='AI Mode' className='ai mt-5 cursor-pointer' />
          </button>

          {/* Profile */}
          <div className="profile-menu-container">
            <button className='button2 mt-3' onClick={() => setIsProfileMenuOpen(p => !p)} title="Profile">
              <img className='img1' src={profile} alt="profile" />
            </button>
            {isProfileMenuOpen && (
              <div className="profile-dropdown-menu">
                <button className="dropdown-item">Home</button>
                <button className="dropdown-item logout-link" type="button" onClick={handleLoginToggle}>
                  {isLoggedIn ? 'Logout' : 'Login'}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <hr className="separator" />

      <main className="flex h-[calc(100vh-64px)] overflow-hidden">
        {/* ---------------- FILE PANEL ---------------- */}
        <section className="filesection-login"><br />
          <div className="filepane-heading1"><b>FILES</b></div>
          <hr style={{ width: '105%', marginBottom: '10px' }} />
          <div style={{ width: '100%', padding: '0 5px' }}>
            {isLoggedIn ? (
              <div style={{ marginTop: '15px' }}>
                <div style={{ color: '#ffffff', marginBottom: '15px', fontSize: '0.9em', fontWeight: 'bold' }}>
                  YOUR PROJECTS
                </div>
                {DUMMY_FILES.map((file, index) => (
                  <div key={index} className="file-item">{file}</div>
                ))}
              </div>
            ) : (
              <>
                <div className="leftheading"><b>Login to view your Files</b><br /><br /></div>
                <button className="button-2" onClick={handleLoginToggle}>Login</button>
              </>
            )}
          </div>
        </section>

        {/* ---------------- CODE + TERMINAL SECTION ---------------- */}
        <section
          className="editor-section flex-grow flex flex-col bg-transparent transition-all duration-300 min-w-0"
          style={{ width: mainContentWidth }}
        >
          {/* CODE EDITOR */}
          <section className="main-content flex-grow flex flex-col h-full bg-transparent">
            <div className="toolbar flex justify-between items-center">
              <div className="left-toolbar">
                <div className="file-explorer-path">
                  <span className="path-item">Editor</span>
                </div>
              </div>
              <div className="right-toolbar" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button title="Format Code"><img className="copy" src={format} alt="format" /></button>
                <button title="Copy"><img className="copy" src={copy} alt="copy" /></button>
                <button title="Reset"><img className="copy" src={refresh} alt="reset" /></button>
                <select onChange={handleLanguageChange} value={selectedLanguage}>
                  <option>Javascript</option>
                  <option>C++</option>
                  <option>C</option>
                  <option>Java</option>
                  <option>Python</option>
                </select>
                <button className="button-6" onClick={handleRun} disabled={isRunning}>
                  {isRunning ? "Running..." : "Run"}
                </button>
              </div>
            </div>

            <div className="code-editor-area flex-grow overflow-hidden">
              <div className="code-editor">
                <Editor
                  height="100%"
                  width="100%"
                  language={languageMap[selectedLanguage]}
                  theme="vs-dark"
                  options={{ fontSize: 16 }}
                  value={code}
                  onChange={(value) => setCode(value || '')}
                  onMount={handleEditorDidMount}
                />
              </div>
            </div>
          </section>

          <div className="container2"></div>

          {/* TERMINAL */}
<section className="main-content-terminal flex-shrink-0 h-60 flex flex-col">
  <div className="toolbar-terminal h-10 flex justify-between items-center px-2">
    <div className="left-toolbar1-terminal flex items-center gap-2">
      <img className="terminal" src={terminal} alt="terminal" />
      <span className="path-item-terminal">Terminal</span>
    </div>
    <div className="right-toolbar1-terminal flex items-center gap-2">
      <button className="button-2" onClick={handleClearOutput}>Clear</button>
    </div>
  </div>

  <div className="code-editor-area-terminal flex-grow">
    <div className="code-editor-terminal">
      <textarea
        ref={textareaRef}
        value={output}
        onChange={(e) => setOutput(e.target.value)} // ✅ Allow typing input
        placeholder="Type input here or view output..."
        className="textarea1"
        style={{ whiteSpace: 'pre-wrap', overflowY: 'auto' }}
      />
    </div>
  </div>

  {/* ✅ Small hint line for users */}
  <div style={{
    color: '#6b7280',
    fontSize: '12px',
    padding: '2px 8px',
    background: '#0f1113',
    borderTop: '1px solid #222',
    fontFamily: 'monospace'
  }}>
    ↳ Type input above before clicking “Run”
  </div>
</section>

        </section>

        {/* ---------------- AI PANEL ---------------- */}

<div className="container2"></div>
<section
  className="main-content-ai flex-shrink-0 flex flex-col transition-all duration-300"
  style={{
    width: isAIModeOpen ? `${AI_PANEL_WIDTH}px` : '0px',
    visibility: isAIModeOpen ? 'visible' : 'hidden',
    minWidth: isAIModeOpen ? `${AI_PANEL_WIDTH}px` : '0px',
  }}
>
  {/* AI Toolbar */}
  <div className="toolbar-ai">
    <div className="left-toolbar-ai">
      <div className="file-explorer-path-ai flex items-center">
        <SiRobotframework className="delete mt-0.5" />
        &nbsp;&nbsp;
        <span className="path-item-ai text-lg font-bold">AI-Mode</span>
      </div>
    </div>
    <div className="right-toolbar-ai">
      <button
        title="Close AI Mode"
        onClick={toggleAIMode}
        className="p-1 rounded hover:bg-gray-700 transition-colors cursor-pointer"
      >
        <IoCloseOutline />
      </button>
    </div>
  </div>

  {/* AI Input Bar */}
  <div className="code-editor-area-ai">
    <div className="code-editor-ai">
      <div className="toolbar-ai-bar mt-165 ml-1.5 mr-1.5 flex justify-between items-center">
        <input
          type="text"
          className="input-ai w-full bg-transparent text-white placeholder-gray-500 text-sm p-1"
          placeholder="Ask AI..."
        />
        <button title="Send" className="ml-2 text-blue-400 hover:text-blue-300 transition-colors p-1">
          <IoMdSend title="Send" className="delete cursor-pointer" />
        </button>
      </div>
    </div>
  </div>
</section>

      </main>
    </div>
  );
}
