import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import AuthContext from '../context/AuthContext'
import '../styles/style.css';

function Loginpage() {

  const { loginUser } = useContext(AuthContext)

  const handleSubmit = e => {
    e.preventDefault()
    const email = e.target.email.value
    const password = e.target.password.value

    email.length > 0 && loginUser(email, password)
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#ff800050", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div className="card p-4" style={{ width: "500px", borderRadius: "1rem", marginRight: "200px" , marginTop: "40px"}}>
        <div className="text-center mb-3">
          <h5 className="fw-bold">Welcome back 👋</h5>
          <p className="fw-normal" style={{ fontSize: "1rem" }}>Sign into your account in <b>BM</b></p>
        </div>
        <form onSubmit={handleSubmit} className="text-center">
          <div className="form-outline mb-3">
            <input
              type="email"
              placeholder="Email"
              className="form-control form-control-sm"
              name="email"
              style={{ width: "350px", margin: "0 auto" }} 
            />
          </div>
          <div className="form-outline mb-3">
            <input
              type="password"
              placeholder="Password"
              className="form-control form-control-sm"
              name="password"
              style={{ width: "350px", margin: "0 auto" }}
            />
          </div>
          <div className="pt-1 mb-3">
            <button className="btn btn-dark btn-sm" type="submit" style={{ width: "350px"}}>
              Login
            </button>
          </div>
          <a className="small text-muted" href="#!">Forgot password?</a>
          <p className="mb-2">
            Don't have an account?{" "}
            <Link to="/register" style={{ color: "#393f81" }}>Register Now</Link>
          </p>
          <a href="#!" className="small text-muted">Terms of use</a> | 
          <a href="#!" className="small text-muted"> Privacy policy</a>
        </form>
      </div>

      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
        <img 
          style={{
            width: "100px", 
            marginTop: "40px", 
            marginBottom: "20px",
          }} 
          src={require('../images/bm-bg.png')} 
          alt="Chatty Logo"
        />

        <div className="animated-text" style={{ fontSize: "1.2rem", fontWeight: "bold", textAlign: "center" }}>
          Join <b>BM</b> <br/> Unleash Your Voice, Ignite Meaningful Conversations!
        </div>
      </div>


    </div>
  )
}

export default Loginpage
