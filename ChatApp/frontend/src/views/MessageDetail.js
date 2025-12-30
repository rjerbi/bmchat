import React from 'react';
import './style/Message.css';
import { useState, useEffect } from 'react';
import useAxios from '../utils/useAxios';
import { getAutoResponse, detectLanguage, responses, normalizeText } from '../views/autoResponses';
import jwtDecode from 'jwt-decode';
import { Link, useParams, useHistory } from 'react-router-dom/';
import moment from 'moment';
import axios from 'axios';

function MessageDetail() {
  const baseURL = 'http://127.0.0.1:8000/api';
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState([]);
  const [user, setUser] = useState([]);
  const [profile, setProfile] = useState([]);
  const [newMessage, setNewMessage] = useState({ message: '' });
  const [newSearch, setNewSearch] = useState({ search: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [translatedMessages, setTranslatedMessages] = useState({});
  const [suggestedReplies, setSuggestedReplies] = useState({});
  const [popupVisibleFor, setPopupVisibleFor] = useState(null); // Track which message shows popup
  const axiosInstance = useAxios();
  const id = useParams();
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
      });
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await axiosInstance.get(`${baseURL}/get-messages/${user_id}/${id.id}/`);
        const newMessages = res.data;
        const updatedSuggestedReplies = {};
        newMessages.forEach(msg => {
          const responseObj = getAutoResponse(msg.message);
          if (responseObj.type === 'popup') {
            const lang = detectLanguage(msg.message);
            const matchingRule = responses.find(rule =>
              rule.keywords.some(keyword =>
                new RegExp(`\\b${normalizeText(keyword)}\\b`, 'i').test(normalizeText(msg.message))
              )
            );
            if (matchingRule && matchingRule.responses[lang]) {
              const suggestions = [...matchingRule.responses[lang]];
              updatedSuggestedReplies[msg.id] = suggestions.slice(0, 2);
            }
          }
        });
        setSuggestedReplies(updatedSuggestedReplies);
        setMessage(newMessages);
      } catch (error) {
        console.log(error);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        await axiosInstance.get(baseURL + '/profile/' + id.id + '/').then((res) => {
          setProfile(res.data);
          setUser(res.data.user);
        });
      } catch (error) {
        console.log(error);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (event) => {
    setNewMessage({
      ...newMessage,
      [event.target.name]: event.target.value,
    });
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const SendMessage = () => {
    const formdata = new FormData();
    formdata.append('user', user_id);
    formdata.append('sender', user_id);
    formdata.append('reciever', id.id);
    formdata.append('message', newMessage.message);
    formdata.append('is_read', false);
    if (selectedFile) {
      formdata.append('image', selectedFile);
    }
    try {
      axiosInstance
        .post(baseURL + '/send-messages/', formdata, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then((res) => {
          document.getElementById('text-input').value = '';
          setNewMessage({ message: '' });
          setSelectedFile(null);
        });
    } catch (error) {
      console.log('error ===', error);
    }
  };

  const handleAutoReply = async (responseText) => {
    const formdata = new FormData();
    formdata.append('user', user_id);
    formdata.append('sender', user_id);
    formdata.append('reciever', id.id);
    formdata.append('message', responseText);
    formdata.append('is_read', false);
    try {
      await axiosInstance.post(baseURL + '/send-messages/', formdata, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setNewMessage({ message: '' });
      document.getElementById('text-input').value = '';
      setPopupVisibleFor(null);
    } catch (error) {
      console.error('Error sending auto reply:', error);
    }
  };

  const handleSearchChange = (event) => {
    setNewSearch({
      ...newSearch,
      [event.target.name]: event.target.value,
    });
  };

  const SearchUser = () => {
    axiosInstance
      .get(baseURL + '/search/' + newSearch.username + '/')
      .then((res) => {
        if (res.status === 404) {
          alert('User does not exist');
        } else {
          history.push('/search/' + newSearch.username + '/');
        }
      })
      .catch(() => {
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
                  <div className="d-flex align-items-center">
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
                    to={'/inbox-message/' + (message.sender.id === user_id ? message.reciever.id : message.sender.id) + '/'}
                    key={message.id}
                    className="list-group-item list-group-item-action border-0"
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
                          alt="Sender"
                          width={40}
                          height={40}
                        />
                      )}
                      {message.sender.id === user_id && (
                        <img
                          src={message.reciever_profile.image}
                          className="rounded-circle mr-1"
                          alt="Receiver"
                          width={40}
                          height={40}
                        />
                      )}
                      <div className="flex-grow-1 ml-3">
                        {message.sender.id === user_id
                          ? message.reciever_profile.full_name || message.reciever.username
                          : message.sender.username}
                        <div className="small">
                          <small>{message.message}</small>
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
                        src={profile.image}
                        className="rounded-circle mr-1"
                        alt="Profile"
                        width={40}
                        height={40}
                      />
                    </div>
                    <div className="flex-grow-1 pl-3">
                      <strong>{profile.full_name}</strong>
                      <div className="text-muted small">
                        <em>@{user.username}</em>
                      </div>
                    </div>
                    <div>
                      {/* Audio Call */}
                      <a
                        href="https://meet.google.com/new  "
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary btn-lg mr-1 px-3"
                        title="Start Audio Call"
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
                          className="feather feather-phone feather-lg"
                        >
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                      </a>
                      {/* Video Call */}
                      <a
                        href="https://meet.google.com/new  "
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-info btn-lg mr-1 px-3 d-none d-md-inline-block"
                        title="Start Video Call"
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
                          className="feather feather-video feather-lg"
                        >
                          <polygon points="23 7 16 12 23 17 23 7"></polygon>
                          <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                        </svg>
                      </a>
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
                    {message.map((msg, index) => (
                      <>
                        {msg.sender.id !== user_id && (
                          <div className="chat-message-left pb-4" key={index}>
                            <div>
                              <img
                                src={msg.sender_profile.image}
                                className="rounded-circle mr-1"
                                alt="Chris Wood"
                                style={{ objectFit: 'cover' }}
                                width={40}
                                height={40}
                              />
                            </div>
                            <div className="flex-shrink-1 bg-light rounded py-2 px-3 mr-3">
                              <div className="font-weight-bold mb-1">You</div>
                              {msg.message}
                              {msg.image && (
                                <img
                                  src={msg.image}
                                  alt="message"
                                  style={{ maxWidth: '100px', marginTop: '10px' }}
                                />
                              )}
                              <br />
                              <span className="mt-3">
                                {moment.utc(msg.date).local().startOf('seconds').fromNow()}
                              </span>
                              <br />
                              {/* Button Container */}
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                {/* See Translation Button */}
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    translateMessage(msg.message, msg.id);
                                  }}
                                  style={{
                                    background: '#6c757d',
                                    color: 'white',
                                    border: 'none',
                                    padding: '5px 10px',
                                    fontSize: '12px',
                                    cursor: 'pointer',
                                    marginRight: '10px', // Add spacing here
                                  }}
                                >
                                  See Translation
                                </button>
                                {/* Show Suggested Replies Button */}
                                {suggestedReplies[msg.id] && popupVisibleFor === msg.id && (
                                  <div className="suggestion-popup mt-2" style={{
                                    backgroundColor: '#f9f9f9',
                                    border: '1px solid #ccc',
                                    borderRadius: '5px',
                                    padding: '10px',
                                    marginTop: '10px'
                                  }}>
                                    <strong>Suggestions:</strong>
                                    <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                                      {suggestedReplies[msg.id].map((reply, idx) => (
                                        <li key={idx}>
                                          <button
                                            onClick={() => handleAutoReply(reply)}
                                            style={{
                                              background: '#007bff',
                                              color: 'white',
                                              border: 'none',
                                              padding: '5px 10px',
                                              margin: '5px 0',
                                              cursor: 'pointer',
                                              width: '100%',
                                              textAlign: 'left'
                                            }}
                                          >
                                            {reply}
                                          </button>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {!popupVisibleFor && suggestedReplies[msg.id] && (
                                  <button
                                    onClick={() => setPopupVisibleFor(msg.id)}
                                    style={{
                                      background: '#6c757d',
                                      color: 'white',
                                      border: 'none',
                                      padding: '5px 10px',
                                      fontSize: '12px',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    Show Suggested Replies
                                  </button>
                                )}
                              </div>
                              {translatedMessages[msg.id] && (
                                <div style={{ marginTop: '5px' }}>
                                  <strong>Translated ({selectedLanguage}):</strong> {translatedMessages[msg.id]}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        {msg.sender.id === user_id && (
                          <div className="chat-message-right pb-4" key={index}>
                            <div>
                              <img
                                src={msg.sender_profile.image}
                                className="rounded-circle mr-1"
                                alt="Receiver"
                                style={{ objectFit: 'cover' }}
                                width={40}
                                height={40}
                              />
                              <br />
                              <div className="text-muted small text-nowrap mt-2">
                                {moment.utc(msg.date).local().startOf('seconds').fromNow()}
                              </div>
                            </div>
                            <div className="flex-shrink-1 bg-light rounded py-2 px-3 ml-3">
                              <div className="font-weight-bold mb-1">{msg.reciever_profile.full_name}</div>
                              {msg.message}
                              {msg.image && (
                                <img
                                  src={msg.image}
                                  alt="message"
                                  style={{ maxWidth: '100px', marginTop: '10px' }}
                                />
                              )}
                              <br />
                              {/* See Translation Button */}
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  translateMessage(msg.message, msg.id);
                                }}
                                style={{
                                  background: '#6c757d',
                                  color: 'white',
                                  border: 'none',
                                  padding: '5px 10px',
                                  fontSize: '12px',
                                  cursor: 'pointer',
                                  marginTop: '10px',
                                }}
                              >
                                See Translation
                              </button>
                              {translatedMessages[msg.id] && (
                                <div style={{ marginTop: '5px' }}>
                                  <strong>Translated ({selectedLanguage}):</strong> {translatedMessages[msg.id]}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    ))}
                  </div>
                </div>
                <div className="flex-grow-0 py-3 px-4 border-top">
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Type your message"
                      value={newMessage.message}
                      name="message"
                      id="text-input"
                      onChange={handleChange}
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
                    <button onClick={SendMessage} className="btn btn-primary">
                      Send
                    </button>
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

export default MessageDetail;

