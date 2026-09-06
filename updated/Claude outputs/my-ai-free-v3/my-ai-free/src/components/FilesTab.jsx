import { useState } from 'react'

const TEXT_EXTENSIONS = ['.html', '.js', '.jsx', '.css', '.json', '.md', '.txt', '.ts', '.tsx']

function isTextFile(name) {
  return TEXT_EXTENSIONS.some((ext) => name.toLowerCase().endsWith(ext))
}

function FilesTab() {
  const [isSupported] = useState('showDirectoryPicker' in window)
  const [files, setFiles] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)
  const [fileContent, setFileContent] = useState('')
  const [errorMessage, setErrorMessage] = useState(null)

  const openFolder = async () => {
    setErrorMessage(null)
    try {
      const dirHandle = await window.showDirectoryPicker()
      const entries = []

      for await (const [name, handle] of dirHandle.entries()) {
        if (handle.kind === 'file' && isTextFile(name)) {
          entries.push({ name, handle })
        }
      }

      entries.sort((a, b) => a.name.localeCompare(b.name))
      setFiles(entries)
      setSelectedFile(null)
      setFileContent('')

      if (entries.length === 0) {
        setErrorMessage('No HTML, JS, CSS, JSON, MD, or TXT files found in the top level of that folder.')
      }
    } catch (err) {
      // AbortError happens when the user cancels the picker — not a real error.
      if (err.name !== 'AbortError') {
        setErrorMessage('Could not open that folder. Try again.')
      }
    }
  }

  const openFile = async (entry) => {
    setErrorMessage(null)
    setSelectedFile(entry.name)
    try {
      const file = await entry.handle.getFile()
      const text = await file.text()
      setFileContent(text)
    } catch {
      setErrorMessage(`Could not read ${entry.name}.`)
    }
  }

  if (!isSupported) {
    return (
      <p className="chat-error">
        Your browser doesn't support the File System Access API used for this feature.
        Try Chrome or Edge.
      </p>
    )
  }

  return (
    <div className="files-tab">
      <button type="button" className="voice-button" onClick={openFolder}>
        📁 Open a folder
      </button>

      {errorMessage && <p className="chat-error">{errorMessage}</p>}

      <div className="files-layout">
        <ul className="file-list">
          {files.map((entry) => (
            <li key={entry.name}>
              <button
                type="button"
                className={entry.name === selectedFile ? 'file-item active' : 'file-item'}
                onClick={() => openFile(entry)}
              >
                {entry.name}
              </button>
            </li>
          ))}
        </ul>

        <pre className="file-content">
          {selectedFile ? fileContent : 'Select a file to view it here.'}
        </pre>
      </div>
    </div>
  )
}

export default FilesTab
