import React, { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import './Compilerstyle.css';
import profile from './pics/profile.png';
import copy from './pics/copy.png';
import terminalIcon from './pics/terminal.png';
import newlogo3 from './pics/newlogo3.png';
import finale from './pics/finale.png';
import refresh from './pics/refresh.png';
import format from './pics/format.png';
import light from './pics/light_mode.png';
import dark from './pics/dark_mode.png';
import delet from './pics/delete.png';
import { SiRobotframework } from "react-icons/si";
import { IoCloseOutline } from "react-icons/io5";
import { IoMdSend } from "react-icons/io";
import "tailwindcss";

/**
 * This component has been rebuilt to use the exact original JSX structure
 * so your original CSS (Compilerstyle.css) works unchanged.
 *
 * Terminal behavior: SINGLE textarea used for BOTH input and output (Option A).
 * Judge0 API integrated — stdin uses the current textarea contents.
 */

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
  // UI state
  const [selectedLanguage, setSelectedLanguage] = useState('Javascript');
  const [code, setCode] = useState(codeSnippets['Javascript']);
  const [output, setOutput] = useState(''); // single textarea content (input + output)
  const [isRunning, setIsRunning] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [istheme, setIstheme] = useState(false);
  const [isAIModeOpen, setIsAIModeOpen] = useState(false);

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

  // Keep the Monaco theme consistent with original
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

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setSelectedLanguage(newLang);
    setCode(codeSnippets[newLang]);
  };

  // Run -> Submit to Judge0. Terminal (single textarea) is used for stdin and also receives appended output.
  const handleRun = async () => {
    // get current textarea content (input + possible previous output)
    const currentTerminal = output || '';

    setIsRunning(true);
    // Append a status message to the textarea
    setOutput(prev => (prev ? prev + '\n' : '') + '⏳ Submitting to Judge0...\n');

    try {
      const payload = {
        source_code: code,
        language_id: judge0LangId[selectedLanguage],
        stdin: currentTerminal // per Option A: use full textarea as stdin
      };

      const res = await fetch("https://ce.judge0.com/submissions/?base64_encoded=false&wait=true", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const text = await res.text();
        setOutput(prev => prev + `\nError: Judge0 responded with status ${res.status}\n${text}\n`);
        return;
      }

      const data = await res.json();

      // judge0 returns compile_output / stderr / stdout (not base64 if base64_encoded=false)
      let resultText = '\n=== Execution Result ===\n';

      if (data.compile_output) {
        resultText += `Compile Error:\n${data.compile_output}\n`;
      }

      if (data.stderr) {
        resultText += `Runtime Error:\n${data.stderr}\n`;
      }

      if (data.stdout) {
        resultText += `Output:\n${data.stdout}\n`;
      }

      if (!data.compile_output && !data.stderr && !data.stdout) {
        // fallback to status description
        if (data.status && data.status.description) {
          resultText += `Status: ${data.status.description}\n`;
        } else {
          resultText += 'No output received.\n';
        }
      }

      // Append execution result to terminal textarea (preserve history)
      setOutput(prev => prev + resultText + '\n');

      // Scroll textarea to bottom so user sees latest output
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
        }
      }, 50);
    } catch (err) {
      setOutput(prev => prev + `\nNetwork/Error: ${err.message}\n`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleClearOutput = () => setOutput('');
  const toggleAIMode = () => setIsAIModeOpen(p => !p);
  const handleLoginToggle = () => setIsLoggedIn(p => !p);
  const themeToggle = () => setIstheme(p => !p);

  // Keep main width calculation but preserve original structure
  const mainContentWidth = isAIModeOpen
    ? `calc(100% - ${FILE_PANEL_WIDTH}px - ${AI_PANEL_WIDTH}px - 8px)`
    : `calc(100% - ${FILE_PANEL_WIDTH}px - 8px)`;

  // ---------- JSX follows original structure so CSS works exactly as before ----------
  return (
    <div className="app-container">
      <header>
        <div className="left-header">
          <span className="left">
            <img className='imglogo-style' src={newlogo3} alt="logo" />&nbsp;
            <img className='img-logo' src={finale} alt="finale" />
          </span>
        </div>

        <div className="right-header">
          {istheme ? (
            <button className='button2' title='Theme' onClick={themeToggle}><img className='setting' src={dark} alt="dark" /></button>
          ) : (
            <button className='button2' title='Theme' onClick={themeToggle}><img className='setting' src={light} alt="light" /></button>
          )}

          <button
            title='AI Mode'
            onClick={toggleAIMode}
            className={`p-3 mb-4 transition-colors duration-200 ${isAIModeOpen ? 'text-blue-400' : 'text-white-400 hover:text-white'}`}
          >
            <SiRobotframework title='AI Mode' className='ai mt-5 cursor-pointer' />
          </button>

          <div className="profile-menu-container">
            <button className='button2 mt-3' onClick={() => setIsProfileMenuOpen(p => !p)} title="Profile">
              <img className='img1' src={profile} alt="profile" />
            </button>
            {isProfileMenuOpen && (
              <div className="profile-dropdown-menu">
                <a href="/compilein/homepage">
                  <button className="dropdown-item" >Home</button>
                </a>

                {isLoggedIn ? (
                  <button className="dropdown-item logout-link" type="button" onClick={handleLoginToggle}>Logout</button>
                ) : (
                  <button className="dropdown-item logout-link" type="button" onClick={handleLoginToggle}>Login</button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <hr className="separator" />

      <main className="flex h-[calc(100vh-64px)] overflow-hidden">
        {/* left file panel (original structure) */}
        <section className="filesection-login"><br />
          <div className="filepane-heading1">
            <b>FILES</b>
          </div>
          <hr style={{ width: '105%', marginBottom: '10px' }} />
          <div style={{ width: '100%', padding: '0 5px' }}>
            {isLoggedIn ? (
              <div style={{ marginTop: '15px' }}>
                <div style={{ color: '#ffffff', marginBottom: '15px', fontSize: '0.9em', fontWeight: 'bold' }}>
                  YOUR PROJECTS
                </div>
                {DUMMY_FILES.map((file, index) => (
                  <div
                    key={index}
                    className="file-item"
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#303953'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index === 0 ? '#303953ff' : 'transparent'}
                    onClick={(e) => e.currentTarget.style.backgroundColor = '#334474ff'}
                  >
                    {file}
                  </div>
                ))}
                <br />
              </div>
            ) : (
              <>
                <div className="leftheading">
                  <b>Login to view your Files</b><br /><br />
                </div>
                <a href="/compilein/loginpage">
                  <button className="button-2 md:flex md:ml-[60px]" type="button" title='Simulate Login' onClick={handleLoginToggle}>
                    Login
                  </button>
                </a>
              </>
            )}
          </div>
        </section>

        {/* Empty placeholder section (matches original layout) */}
        <section>
          <div className="container"></div>
        </section>

        {/* Editor section - keep same structure and class names */}
        <section
          className="editor-section flex-grow flex flex-col bg-[#1e1e1e] transition-all duration-300 min-w-0"
          style={{ width: mainContentWidth }}
        >
          <section className="main-content flex-grow flex flex-col h-full">
            <div className="toolbar flex justify-between items-center bg-[#282c34] p-2 flex-shrink-0 border-b border-gray-700">
              <div className="left-toolbar">
                <div className="file-explorer-path">
                  <span className="path-item">Editor</span>
                </div>
              </div>
              <div className="right-toolbar">
                <button title='Format Code'><img className='copy' src={format} alt="format" /></button>&nbsp;&nbsp;&nbsp;
                <button title='Copy'><img className='copy' src={copy} alt="copy" /></button>&nbsp;&nbsp;
                <button title='Reset'><img className='copy' src={refresh} alt="refresh" /></button>&nbsp;&nbsp;
                <select id="output-style" onChange={handleLanguageChange} value={selectedLanguage}>
                  <option>Javascript</option>
                  <option>C++</option>
                  <option>C</option>
                  <option>Java</option>
                  <option>Python</option>
                </select>&nbsp;&nbsp;&nbsp;
                <button className="button-6" type="button" title='Run' onClick={handleRun} disabled={isRunning}>
                  {isRunning ? 'Running...' : 'Run'}
                </button>
              </div>
            </div>

            <div className="code-editor-area flex-grow overflow-hidden">
              <div className="code-editor h-full w-full">
                <Editor
                  height="100%"
                  width="100%"
                  language={languageMap[selectedLanguage]}
                  defaultLanguage='javascript'
                  theme="vs-dark"
                  options={{ fontSize: 16 }}
                  value={code}
                  onChange={(value) => setCode(value || '')}
                  onMount={handleEditorDidMount}
                />
              </div>
            </div>
          </section>

          <section>
            <div className="container2"></div>
          </section>

          {/* Terminal (original structure) - single textarea used for both input & output */}
          <section className="main-content-terminal flex-shrink-0 h-60 flex flex-col ">
            <div className="toolbar-terminal h-10">
              <div className="left-toolbar1-terminal">
                <div className="file-explorer-path-terminal">
                  <img className='terminal' src={terminalIcon} alt="terminal" />&nbsp;
                  <span className="path-item-terminal">Terminal</span>
                </div>
              </div>
              <div className="right-toolbar1-terminal">
                <button title='Delete Output'><img className='delete' src={delet} alt="delete" onClick={handleClearOutput} /></button>&nbsp;&nbsp;
                {/* <button title='Clear' className="button-2" onClick={handleClearOutput}>Clear</button>&nbsp;&nbsp; */}
                {/* <button title='Send Input' className="button-2" onClick={handleRun} disabled={isRunning}>
                  <IoMdSend />
                </button> */}
              </div>
            </div>
            <div className="code-editor-area-terminal ">
              <div className="code-editor-terminal">
                <textarea
                  ref={textareaRef}
                  className='textarea1'
                  placeholder="Type input here or view output..."
                  value={output}
                  onChange={(e) => setOutput(e.target.value)} // allow typing/input and show outputs
                />
              </div>
            </div>
          </section>
        </section>

        {/* AI panel (keeps original structure and classes so CSS matches) */}
        <section
          className="main-content-ai flex-shrink-0 flex flex-col bg-[#21252b] shadow-2xl z-50 transition-all duration-300 border-l border-gray-700 ml-2"
          style={{
            width: isAIModeOpen ? `${AI_PANEL_WIDTH}px` : '0px',
            visibility: isAIModeOpen ? 'visible' : 'hidden',
            minWidth: isAIModeOpen ? `${AI_PANEL_WIDTH}px` : '0px',
          }}
        >
          <div className="toolbar-ai">
            <div className="left-toolbar-ai">
              <div className="file-explorer-path-ai flex items-center justify-between">
                <SiRobotframework className='delete mt-0.5 align-right' />&nbsp;&nbsp;
                <span className="path-item-ai text-lg font-bold">AI-Mode</span>
              </div>
              <button title='Close AI Mode' onClick={toggleAIMode} className="p-1 rounded hover:bg-gray-700 transition-colors cursor-pointer lg:ml-55.5">
                <IoCloseOutline />
              </button>
            </div>
          </div>
          <div className="code-editor-area-aix`">
            <div className="toolbar-ai-bar flex-shrink-0 flex mt-170 ml-1.5 mr-1.5">
              <input
                type="text"
                className="input-ai flex-grow bg-transparent text-white focus:outline-none placeholder-gray-500 text-sm p-1"
                placeholder="Ask AI..."
              />
              <button title='Send' className='ml-2 text-blue-400 hover:text-blue-300 transition-colors p-1'>
                <IoMdSend title='Send' className='delete cursor-pointer' />
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
