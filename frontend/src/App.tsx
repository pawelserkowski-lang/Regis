import { useState } from 'react';
import SystemMonitor from './components/SystemMonitor';

function App() {
  const [messages, setMessages] = useState([
    { sender: 'System', text: 'Regis CyberDeck v2.0 initialized...' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setMessages([...messages, { sender: 'User', text: userMsg }]);
    setInput('');

    try {
        const res = await fetch('http://localhost:5000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userMsg })
        });
        const data = await res.json();
        setMessages(prev => [...prev, { sender: 'Regis', text: data.response }]);
    } catch (e) {
        setMessages(prev => [...prev, { sender: 'System', text: 'Error connecting to backend.' }]);
    }
  };

  return (
    <div className="min-h-screen btext-white bg-black p6">
      <div className="scanlines"></div>
      <div className="grid grid-cols-4 gap-6 hr-90vh">
        <div className="col-span-1">
          <SystemMonitor />
        </div>
        <div className="col-span-3 cyber-card">
          <div className="p-4 overflow-y-auto h-full">
            {messages.map((msg, idx) => (
              <div key={idx} className={msg.sender === 'User' ? 'text-right' : 'text-left'}>
                <span className="inline-block px-3 py-2 rounded bg-gray-800">
                  {msg.text}
                </span>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-gray-700">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="w-full bg-transparent outline-none"
              placeholder="Enter command..." />
          </div>
        </div>
      </div>
    </div>
  );
}
export default App;
