import React from 'react'
import { Badge } from 'reactstrap'
import logo from "../../assets/images/javitri_logo.png";
import moment from 'moment';

const WelcomeCard = () => {
    const user = JSON.parse(localStorage.getItem("authUser"));
    return (
        <>
            <style>
                {`
        .welcome-card-premium {
            background: #fff;
            border-radius: 28px;
            border: 1px solid rgba(0,0,0,0.03);
            box-shadow: 0 5px 15px rgba(0,0,0,0.02);
            height: 100%;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
        }
        .welcome-card-premium:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.05);
        }
        `}
            </style>
            <div className="welcome-card-premium p-3">
                <div className="p-2 bg-light rounded-circle me-3 flex-shrink-0">
                    <img src={logo} alt="logo" style={{ width: "50px", height: "50px", objectFit: "contain" }} />
                </div>
                <div className="overflow-hidden">
                    <h4 className="fw-bold  text-dark text-truncate">Welcome! {user.role}</h4>
                    {/* <h6 className="text-dark mb-1 text-truncate">{user.name}</h6> */}
                  {/* <h6 className="text-dark mb-1 text-truncate">{user.role}</h6> */}
                    <Badge pill color="light" className="px-2 py-1 bg-soft-info text-info" style={{ fontSize: '0.75rem' }}>
                        {moment().format('dddd, Do MMM')}
                    </Badge>
                </div>
            </div>
        </>
    )
}

export default WelcomeCard