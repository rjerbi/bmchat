import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

function Registerpage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  const { registerUser } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    registerUser(email, username, password, password2);
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#ff800050", display: "flex", alignItems: "center", justifyContent: "center", paddingTop: "40px" }}>
      <div className="container">
        <div className="row d-flex justify-content-center align-items-center">
          <div className="col-md-10 col-lg-8"> {/* Smaller container */}
            <div className="card" style={{ borderRadius: "1rem" }}>
              <div className="row g-0">
                <div className="col-md-5 d-none d-md-block">
                  <img
                    src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/img1.webp"
                    alt="login form"
                    className="img-fluid"
                    style={{ borderRadius: "1rem 0 0 1rem", height: "100%" }}
                  />
                </div>
                <div className="col-md-7 d-flex align-items-center">
                  <div className="card-body p-4 text-black">
                    <form onSubmit={handleSubmit}>
                      <div className="d-flex align-items-center mb-3">
                        <img 
                          style={{ width: "40px", marginRight: "10px", paddingTop:"15px" }} 
                          src={require('../images/chatbg.png')} 
                          alt="" 
                        />
                        <span className="h5 fw-bold mb-0">
                          Welcome to <b>BM 👋</b>
                        </span>
                      </div>
                      <h5 className="fw-normal mb-3" style={{ fontSize: "1rem" }}>
                        Not a member? Sign Up
                      </h5>
                      <div className="form-outline mb-3">
                        <input
                          type="email"
                          className="form-control form-control-sm"
                          placeholder="Email"
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <div className="form-outline mb-3">
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Username"
                          onChange={(e) => setUsername(e.target.value)}
                        />
                      </div>
                      <div className="form-outline mb-3">
                        <input
                          type="password"
                          className="form-control form-control-sm"
                          placeholder="Password"
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                      <div className="form-outline mb-3">
                        <input
                          type="password"
                          className="form-control form-control-sm"
                          placeholder="Confirm Password"
                          onChange={(e) => setPassword2(e.target.value)}
                        />
                      </div>
                      <div className="pt-1 mb-3">
                        <button className="btn btn-dark btn-sm btn-block" type="submit">
                          Register
                        </button>
                      </div>
                      <p className="mb-4">
                        Already have an account?{" "}
                        <Link to="/login" style={{ color: "#393f81" }}>
                          Login Now
                        </Link>
                      </p>
                      <a href="#!" className="small text-muted">Terms of use | </a>
                      <a href="#!" className="small text-muted">Privacy policy</a>
                    </form>
                  </div>
                </div>
              </div>
            </div> {/* End of Card */}
          </div> {/* End of col-md-8 col-lg-6 */}
        </div>
      </div>
    </div>
  );
}

export default Registerpage;
