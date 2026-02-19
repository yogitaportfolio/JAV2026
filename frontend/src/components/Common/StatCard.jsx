import React from "react";
import PropTypes from "prop-types";

const StatCard = ({ title, value, icon, color, gradient, desc, className, style, noCol, }) => {
  const CardContent = (
    <div className={`admin-stat-card text-center  p-3 ${className || ""}`} style={style}>
      <style>
        {`
        .admin-stat-card {
            background: #fff;
            border-radius: 28px;
            border: 1px solid rgba(0,0,0,0.03);
            box-shadow: 0 5px 15px rgba(0,0,0,0.02);
            height: 100%;
            transition: all 0.3s ease;
        }
        .admin-stat-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.05);
        }
        .stat-icon-wrapper {
            width: 60px;
            height: 60px;
            border-radius: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            font-size: 26px;
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
        `}
      </style>
      <div className="stat-icon-wrapper mx-auto mb-3" style={{ background: gradient || (color ? `var(--bs-${color})` : '#2a3042') }}>
        <i className={`bx ${icon}`}></i>
      </div>
      <h2 className="fw-bold mb-1 text-dark">{value}</h2>
      <h6 className="fw-bold mb-1 text-muted" style={{ fontSize: '0.85rem' }}>{title}</h6>
      {desc && <p className="text-muted small mb-0 d-none d-md-block opacity-75">{desc}</p>}
    </div>
  );

  if (noCol) return CardContent;

  return (
    <>
      {CardContent}
    </>
  );
};

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.string.isRequired,
  color: PropTypes.string,
  gradient: PropTypes.string,
  desc: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
  noCol: PropTypes.bool,
  md: PropTypes.number,
};

export default StatCard;
