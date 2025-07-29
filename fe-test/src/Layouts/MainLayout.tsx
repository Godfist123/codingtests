import Header from './Header';
import Menu from './Menu';

import './MainLayout.css';

const MainLayout = (props: { title: string; children: JSX.Element }) => (
    <div id="container">
        <Menu />
        <div id="main">
            <Header title={props.title} />
            <div id="content">{props.children}</div>
        </div>
    </div>
);

export default MainLayout;
