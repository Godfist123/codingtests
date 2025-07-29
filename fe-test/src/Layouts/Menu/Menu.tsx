import { NavLink, useLocation } from 'react-router-dom';

import classes from './Menu.module.css';

const Menu = () => {
    const { pathname } = useLocation();

    return (
        <span className={classes.menu}>
            <div className={`${classes.wrapper} ${classes.expanded} ${classes.desktop}`}>
                <div className={`${classes.middleSection} ${classes.middleSectionExpanded}`}>
                    <div className={classes.topSection}>
                        <NavLink to="/dashboard" className={classes.logo}>
                            <img src="https://login-resources.prd.aws.ofx.com/styles/images/OFXLogo.svg" alt="OFX" />
                        </NavLink>
                    </div>

                    <nav>
                        <>
                            <div className={`${classes.section} ${classes.second}`}>
                                <NavLink
                                    className={`${classes.pageLink} ${
                                        pathname.includes('/rates') || pathname === '/' ? classes.active : ''
                                    }`}
                                    data-toggle="tooltip"
                                    data-placement="bottom"
                                    title="Rates"
                                    to="/rates"
                                >
                                    <img src="/img/icons/Transfer.svg" alt="Rates" />
                                    <span className={classes.pageLinkText}>Rates</span>
                                </NavLink>
                            </div>
                        </>
                    </nav>
                </div>
            </div>
        </span>
    );
};

export default Menu;
