import React, { useState } from "react";
import PropTypes from "prop-types";
//i18n
import { withTranslation } from "react-i18next";
// Redux
import { Link, useNavigate } from "react-router-dom";
import avatar from "../../../assets/images/users/avatar.webp"
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import { useDispatch } from "react-redux";
import { logoutUser } from "../../../store/actions";

const ProfileMenu = (props) => {
  const [menu, setMenu] = useState(false);
  const user = JSON.parse(localStorage.getItem('authUser'))
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logoutUser(navigate));
  };

  return (
    <React.Fragment>
      <Dropdown
        isOpen={menu}
        toggle={() => setMenu(!menu)}
        className="d-inline-block"
      >
        <DropdownToggle
          className="btn header-item"
          id="page-header-user-dropdown"
          tag="button"
        >
          <img
            className="rounded-circle header-profile-user"
            src={avatar || ''}
            alt="Header Avatar"
          />
          {/* <span className="d-none d-xl-inline-block ms-1 text-capitalize">{username ? username : ''}</span> */}
          {/* <i className="bx bx-chevron-down d-none d-xl-inline-block" /> */}
          <span className=" ms-1 text-capitalize">{user?.name ? user?.name : ''}</span>
          <i className="bx bx-chevron-down" />
        </DropdownToggle>
        <DropdownMenu className="dropdown-menu-end">
          <DropdownItem tag={Link} to="/change_password">
            <i className="bx bx-user font-size-16 align-middle me-1" />
            Change Password
          </DropdownItem>
          <div className="dropdown-divider" />
          <DropdownItem tag={Link} onClick={handleLogout} className="text-danger">
            <i className="bx bx-power-off font-size-16 align-middle me-1 text-danger" />
            Logout
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>

    </React.Fragment>
  );
};

ProfileMenu.propTypes = {
  success: PropTypes.any,
  t: PropTypes.any,
};

export default withTranslation()(ProfileMenu);
