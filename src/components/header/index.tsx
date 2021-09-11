import { FunctionalComponent, h } from 'preact';
import { Link } from 'preact-router/match';
import style from './style.css';

import "@fontsource/ubuntu-condensed";

const Header: FunctionalComponent = () => {
    return (
        <header class={style.header}>
            <img class={style.xgLogo} src='/assets/xg_logo.svg' />
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
