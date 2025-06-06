import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [files, setFiles] = useState([]);
  const [currentPath, setCurrentPath] = useState('/');
  const [newDir, setNewDir] = useState('');
  const [authenticated, setAuthenticated] = useState(false);

  const API = import.meta.env.VITE_API_URL;
  const PASSWORD = import.meta.env.VITE_APP_PASSWORD;

  useEffect(() => {
    const inputPassword = prompt("🔐 비밀번호를 입력하세요");
    if (inputPassword !== PASSWORD) {
      alert("❌ 비밀번호가 일치하지 않습니다.");
      return;
    }
    setAuthenticated(true);
    fetchFiles('/');
  }, []);

  const fetchFiles = async (path = '/') => {
    try {
      const res = await axios.get(`${API}/files`, { params: { path } });
      setFiles(res.data.files);
      setCurrentPath(path);
    } catch (err) {
      console.error('파일 목록 가져오기 실패:', err);
      setFiles([]);
    }
  };

  const uploadFile = async (e) => {
    const formData = new FormData();
    formData.append('file', e.target.files[0]);
    formData.append('path', currentPath);

    try {
      await axios.post(`${API}/upload`, formData);
      fetchFiles(currentPath);
    } catch (err) {
      console.error('업로드 실패:', err);
    }
  };

  const createDirectory = async () => {
    if (!newDir) return;

    try {
      await axios.post(`${API}/directory`, null, {
        params: { path: currentPath, name: newDir },
      });
      setNewDir('');
      fetchFiles(currentPath);
    } catch (err) {
      console.error('디렉토리 생성 실패:', err);
    }
  };

  const deleteItem = async (name) => {
    try {
      await axios.delete(`${API}/delete`, {
        params: { path: `${currentPath}/${name}` },
      });
      fetchFiles(currentPath);
    } catch (err) {
      console.error('삭제 실패:', err);
    }
  };

  const goUp = () => {
    const parts = currentPath.split('/').filter(Boolean);
    const upPath = '/' + parts.slice(0, -1).join('/');
    fetchFiles(upPath || '/');
  };

  const download = (name) => {
    window.location.href = `${API}/download?path=${currentPath}/${name}`;
  };

  // 비밀번호 인증 실패 시 아무것도 렌더링하지 않음
  if (!authenticated) return null;

  return (
    <div style={{ padding: 20 }}>
      <h2>📁 현재 경로: {currentPath}</h2>
      <button onClick={goUp}>🔙 상위 폴더로</button>

      <h3>📤 파일 업로드</h3>
      <input type="file" onChange={uploadFile} />

      <h3>📁 새 디렉토리 생성</h3>
      <input
        value={newDir}
        onChange={(e) => setNewDir(e.target.value)}
        placeholder="디렉토리명"
      />
      <button onClick={createDirectory}>생성</button>

      <h3>📄 파일/폴더 목록</h3>
      <ul>
        {Array.isArray(files) && files.length > 0 ? (
          files.map((file) => (
            <li key={file.name}>
              {file.isDirectory ? (
                <button onClick={() => fetchFiles(`${currentPath}/${file.name}`)}>
                  📂 {file.name}
                </button>
              ) : (
                <>📄 {file.name}</>
              )}
              {' '}
              <button onClick={() => deleteItem(file.name)}>🗑 삭제</button>
              {!file.isDirectory && (
                <button onClick={() => download(file.name)}>⬇ 다운로드</button>
              )}
            </li>
          ))
        ) : (
          <li>📭 표시할 파일이 없습니다</li>
        )}
      </ul>
    </div>
  );
}

export default App;
