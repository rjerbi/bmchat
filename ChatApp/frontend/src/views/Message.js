import React from 'react';
import './style/Message.css';
import { useState, useEffect } from 'react';
import useAxios from '../utils/useAxios';
import jwtDecode from 'jwt-decode';
import { Link, useHistory } from 'react-router-dom/';
import moment from 'moment';
import axios from 'axios';

function Message() {
  const baseURL = 'http://127.0.0.1:8000/api';
  const [messages, setMessages] = useState([]);
  const [newSearch, setNewSearch] = useState({ search: '' });
  const [messageText, setMessageText] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [translatedMessages, setTranslatedMessages] = useState({});

  const axiosInstance = useAxios();
  const token = localStorage.getItem('authTokens');
  const decoded = jwtDecode(token);
  const user_id = decoded.user_id;
  const username = decoded.username;
  const history = useHistory();

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'French' },
    { code: 'es', name: 'Spanish' },
    { code: 'it', name: 'Italian' },
    { code: 'ar', name: 'Arabic' },
    { code: 'de', name: 'Deutsch' },
  ];

  const handleLanguageSelect = (code) => {
    setSelectedLanguage(code);
    setShowLanguageMenu(false);
  };

  const translateMessage = async (text, messageId) => {
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/translate/', {
        text,
        dest: selectedLanguage,
      });
      setTranslatedMessages((prev) => ({
        ...prev,
        [messageId]: response.data.translatedText,
      }));
    } catch (error) {
      console.error('Translation error:', error);
    }
  };

  useEffect(() => {
    try {
      axiosInstance.get(baseURL + '/my-messages/' + user_id + '/').then((res) => {
        setMessages(res.data);
        console.log(res.data);
      });
    } catch (error) {
      console.log(error);
    }
  }, []);

  const handleSearchChange = (event) => {
    setNewSearch({
      ...newSearch,
      [event.target.name]: event.target.value,
    });
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleSendMessage = () => {
    const formData = new FormData();
    formData.append('sender', user_id);
    formData.append('reciever', messages[0]?.reciever?.id || user_id);
    formData.append('message', messageText);
    if (selectedFile) {
      formData.append('image', selectedFile);
    }

    axiosInstance
      .post(baseURL + '/send-message/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((res) => {
        setMessageText('');
        setSelectedFile(null);
        axiosInstance.get(baseURL + '/my-messages/' + user_id + '/').then((res) => {
          setMessages(res.data);
        });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const SearchUser = () => {
    axiosInstance
      .get(baseURL + '/search/' + newSearch.username + '/')
      .then((res) => {
        if (res.status === 404) {
          console.log(res.data.detail);
          alert('User does not exist');
        } else {
          history.push('/search/' + newSearch.username + '/');
        }
      })
      .catch((error) => {
        alert('User Does Not Exist');
      });
  };

  return (
    <div>
      <main className="content" style={{ marginTop: '150px' }}>
        <div className="container p-0">
          <h1 className="h3 mb-3">Messages</h1>
          <div className="card">
            <div className="row g-0">
              <div className="col-12 col-lg-5 col-xl-3 border-right">
                <div className="px-4">
                  <div className="d-flfex align-itemfs-center">
                    <div className="flex-grow-1 d-flex align-items-center mt-2">
                      <input
                        type="text"
                        className="form-control my-3"
                        placeholder="Search..."
                        onChange={handleSearchChange}
                        name="username"
                      />
                      <button
                        className="ml-2"
                        onClick={SearchUser}
                        style={{ border: 'none', borderRadius: '50%' }}
                      >
                        <i className="fas fa-search"></i>
                      </button>
                    </div>
                  </div>
                </div>
                {messages.map((message) => (
                  <Link
                    to={'/inbox/' + (message.sender.id === user_id ? message.reciever.id : message.sender.id) + '/'}
                    href="#"
                    className="list-group-item list-group-item-action border-0"
                    key={message.id}
                  >
                    <small>
                      <div className="badge bg-success float-right text-white">
                        {moment.utc(message.date).local().startOf('seconds').fromNow()}
                      </div>
                    </small>
                    <div className="d-flex align-items-start">
                      {message.sender.id !== user_id && (
                        <img
                          src={message.sender_profile.image}
                          className="rounded-circle mr-1"
                          alt="1"
                          width={40}
                          height={40}
                        />
                      )}
                      {message.sender.id === user_id && (
                        <img
                          src={message.reciever_profile.image}
                          className="rounded-circle mr-1"
                          alt="2"
                          width={40}
                          height={40}
                        />
                      )}
                      <div className="flex-grow-1 ml-3">
                        {message.sender.id === user_id &&
                          (message.reciever_profile.full_name !== null
                            ? message.reciever_profile.full_name
                            : message.reciever.username)}
                        {message.sender.id !== user_id && message.sender.username}
                        <div className="small">
                          <small>{message.message}</small>
                          {message.image && (
                            <img
                              src={message.image}
                              alt="message"
                              style={{ maxWidth: '100px', marginTop: '10px' }}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
                <hr className="d-block d-lg-none mt-1 mb-0" />
              </div>
              <div className="col-12 col-lg-7 col-xl-9">
                <div className="py-2 px-4 border-bottom d-none d-lg-block">
                  <div className="d-flex align-items-center py-1">
                    <div className="position-relative">
                      <img
                        src="https://bootdey.com/img/Content/avatar/avatar3.png"
                        className="rounded-circle mr-1"
                        alt="Sharon Lessman"
                        width={40}
                        height={40}
                      />
                    </div>
                    <div className="flex-grow-1 pl-3">
                      <strong>Sarah Hadid</strong>
                      <div className="text-muted small">
                        <em>Online</em>
                      </div>
                    </div>
                    <div>
                      <button className="btn btn-primary btn-lg mr-1 px-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width={24}
                          height={24}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="feather feather-phone feather-lg"
                        >
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                      </button>
                      <button className="btn btn-info btn-lg mr-1 px-3 d-none d-md-inline-block">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width={24}
                          height={24}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="feather feather-video feather-lg"
                        >
                          <polygon points="23 7 16 12 23 17 23 7" />
                          <rect x={1} y={5} width={15} height={14} rx={2} ry={2} />
                        </svg>
                      </button>
                      <button 
                        className="btn btn-light border btn-lg px-3"
                        onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width={24}
                          height={24}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="feather feather-more-horizontal feather-lg"
                        >
                          <circle cx={12} cy={12} r={1} />
                          <circle cx={19} cy={12} r={1} />
                          <circle cx={5} cy={12} r={1} />
                        </svg>
                      </button>
                      {showLanguageMenu && (
                        <div className="language-menu" style={{
                          position: 'absolute',
                          right: '10px',
                          top: '60px',
                          backgroundColor: 'white',
                          border: '1px solid #ccc',
                          borderRadius: '5px',
                          padding: '10px',
                          zIndex: 1000
                        }}>
                          {languages.map((lang) => (
                            <div 
                              key={lang.code} 
                              onClick={() => handleLanguageSelect(lang.code)}
                              style={{
                                padding: '5px 10px',
                                cursor: 'pointer',
                                backgroundColor: selectedLanguage === lang.code ? '#f0f0f0' : 'transparent'
                              }}
                            >
                              {lang.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="position-relative">
                  <div className="chat-messages p-4">
                    <div className="chat-message-right pb-4">
                      <div>
                        <img
                          src="https://bootdey.com/img/Content/avatar/avatar1.png"
                          className="rounded-circle mr-1"
                          alt="Chris Wood"
                          width={40}
                          height={40}
                        />
                        <div className="text-muted small text-nowrap mt-2">
                          2:33 am
                        </div>
                      </div>
                      <div className="flex-shrink-1 bg-light rounded py-2 px-3 mr-3">
                        <div className="font-weight-bold mb-1">You</div>
                        Hey Sarah! How's it going? 😊
                        <br />
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            translateMessage("Hey Sarah! How's it going? 😊", 'msg1');
                          }}
                          style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
                        >
                          See Translation
                        </a>
                        {translatedMessages['msg1'] && (
                          <div style={{ marginTop: '5px' }}>
                            <strong>Translated ({selectedLanguage}):</strong> {translatedMessages['msg1']}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="chat-message-left pb-4">
                      <div>
                        <img
                          src="https://bootdey.com/img/Content/avatar/avatar3.png"
                          className="rounded-circle mr-1"
                          alt="Sharon Lessman"
                          width={40}
                          height={40}
                        />
                        <div className="text-muted small text-nowrap mt-2">
                          2:34 am
                        </div>
                      </div>
                      <div className="flex-shrink-1 bg-light rounded py-2 px-3 ml-3">
                        <div className="font-weight-bold mb-1">Sarah Hadid</div>
                        Hey Alex! I'm good, and you?
                        <br />
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            translateMessage("Hey Alex! I'm good, and you?", 'msg2');
                          }}
                          style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
                        >
                          See Translation
                        </a>
                        {translatedMessages['msg2'] && (
                          <div style={{ marginTop: '5px' }}>
                            <strong>Translated ({selectedLanguage}):</strong> {translatedMessages['msg2']}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="chat-message-right mb-4">
                      <div>
                        <img
                          src="https://bootdey.com/img/Content/avatar/avatar1.png"
                          className="rounded-circle mr-1"
                          alt="Chris Wood"
                          width={40}
                          height={40}
                        />
                        <div className="text-muted small text-nowrap mt-2">
                          2:35 am
                        </div>
                      </div>
                      <div className="flex-shrink-1 bg-light rounded py-2 px-3 mr-3">
                        <div className="font-weight-bold mb-1">You</div>
                        I'm great! Have you seen the new app update?
                        <br />
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            translateMessage("I'm great! Have you seen the new app update?", 'msg3');
                          }}
                          style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
                        >
                          See Translation
                        </a>
                        {translatedMessages['msg3'] && (
                          <div style={{ marginTop: '5px' }}>
                            <strong>Translated ({selectedLanguage}):</strong> {translatedMessages['msg3']}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="chat-message-left pb-4">
                      <div>
                        <img
                          src="https://bootdey.com/img/Content/avatar/avatar3.png"
                          className="rounded-circle mr-1"
                          alt="Sharon Lessman"
                          width={40}
                          height={40}
                        />
                        <div className="text-muted small text-nowrap mt-2">
                          2:36 am
                        </div>
                      </div>
                      <div className="flex-shrink-1 bg-light rounded py-2 px-3 ml-3">
                        <div className="font-weight-bold mb-1">Sarah Hadid</div>
                        Yes!! I love the new interface 😍
                        <br />
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            translateMessage("Yes!! I love the new interface 😍", 'msg4');
                          }}
                          style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
                        >
                          See Translation
                        </a>
                        {translatedMessages['msg4'] && (
                          <div style={{ marginTop: '5px' }}>
                            <strong>Translated ({selectedLanguage}):</strong> {translatedMessages['msg4']}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="chat-message-left pb-4">
                      <div>
                        <img
                          src="https://bootdey.com/img/Content/avatar/avatar3.png"
                          className="rounded-circle mr-1"
                          alt="Sharon Lessman"
                          width={40}
                          height={40}
                        />
                        <div className="text-muted small text-nowrap mt-2">
                          2:37 am
                        </div>
                      </div>
                      <div className="flex-shrink-1 bg-light rounded py-2 px-3 ml-3">
                        <div className="font-weight-bold mb-1">Sarah Hadid</div>
                        It's so smooth.
                        <br />
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            translateMessage("It's so smooth.", 'msg5');
                          }}
                          style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
                        >
                          See Translation
                        </a>
                        {translatedMessages['msg5'] && (
                          <div style={{ marginTop: '5px' }}>
                            <strong>Translated ({selectedLanguage}):</strong> {translatedMessages['msg5']}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="chat-message-right mb-4">
                      <div>
                        <img
                          src="https://bootdey.com/img/Content/avatar/avatar1.png"
                          className="rounded-circle mr-1"
                          alt="Chris Wood"
                          width={40}
                          height={40}
                        />
                        <div className="text-muted small text-nowrap mt-2">
                          2:38 am
                        </div>
                      </div>
                      <div className="flex-shrink-1 bg-light rounded py-2 px-3 mr-3">
                        <div className="font-weight-bold mb-1">You</div>
                        Right?! And they added a To-Do List feature too! Super useful. ✅
                        <br />
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            translateMessage("Right?! And they added a To-Do List feature too! Super useful. ✅", 'msg6');
                          }}
                          style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
                        >
                          See Translation
                        </a>
                        {translatedMessages['msg6'] && (
                          <div style={{ marginTop: '5px' }}>
                            <strong>Translated ({selectedLanguage}):</strong> {translatedMessages['msg6']}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="chat-message-left pb-4">
                      <div>
                        <img
                          src="https://bootdey.com/img/Content/avatar/avatar3.png"
                          className="rounded-circle mr-1"
                          alt="Sharon Lessman"
                          width={40}
                          height={40}
                        />
                        <div className="text-muted small text-nowrap mt-2">
                          2:39 am
                        </div>
                      </div>
                      <div className="flex-shrink-1 bg-light rounded py-2 px-3 ml-3">
                        <div className="font-weight-bold mb-1">Sarah Hadid</div>
                        That's awesome! I always forget things. This will definitely help. 😅
                        <br />
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            translateMessage("That's awesome! I always forget things. This will definitely help. 😅", 'msg7');
                          }}
                          style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
                        >
                          See Translation
                        </a>
                        {translatedMessages['msg7'] && (
                          <div style={{ marginTop: '5px' }}>
                            <strong>Translated ({selectedLanguage}):</strong> {translatedMessages['msg7']}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="chat-message-right mb-4">
                      <div>
                        <img
                          src="https://bootdey.com/img/Content/avatar/avatar1.png"
                          className="rounded-circle mr-1"
                          alt="Chris Wood"
                          width={40}
                          height={40}
                        />
                        <div className="text-muted small text-nowrap mt-2">
                          2:40 am
                        </div>
                      </div>
                      <div className="flex-shrink-1 bg-light rounded py-2 px-3 mr-3">
                        <div className="font-weight-bold mb-1">You</div>
                        Haha, same! I already added "Finish work report"
                        <br />
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            translateMessage('Haha, same! I already added "Finish work report"', 'msg8');
                          }}
                          style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}
                        >
                          See Translation
                        </a>
                        {translatedMessages['msg8'] && (
                          <div style={{ marginTop: '5px' }}>
                            <strong>Translated ({selectedLanguage}):</strong> {translatedMessages['msg8']}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-grow-0 py-3 px-4 border-top">
                      <div className="input-group">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Type your message"
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                        />
                        <label htmlFor="file-input" style={{ cursor: 'pointer', margin: '0 10px', fontSize: '24px' }}>
                          📎
                        </label>
                        <input
                          id="file-input"
                          type="file"
                          style={{ display: 'none' }}
                          onChange={handleFileChange}
                        />
                        <button className="btn btn-primary" onClick={handleSendMessage}>
                          Send
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Message;