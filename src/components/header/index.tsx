import { FunctionalComponent, h } from 'preact';
import { Link } from 'preact-router/match';
import style from './style.css';

import MULogo from '../../assets/mu_logo.svg';
import XGLogo from '../../assets/xg_logo.svg';

const Header: FunctionalComponent = () => {
    return (
        <header class={style.header}>
            {/* <img class={style.xgLogo} src={MULogo} />
            <h1>Explorer</h1> */}
            <img class={style.xgLogo} src={XGLogo} />
            <h1>Explorer</h1>
            <nav>
                <Link activeClassName={style.active} href="/">
                    Drum Kits
                </Link>
                {/* <Link activeClassName={style.active} href="/profile">
                    Me
                </Link>
                <Link activeClassName={style.active} href="/profile/john">
                    John
                </Link> */}
            </nav>
        </header>
    );
};

export default Header;
