import classes from './Loader.module.css';

const Loader = (props) => {
    return (
        <div
            className={classes.loader}
            style={{ width: props.width || '20px', height: props.height || '20px', ...(props.style || {}) }}
        >
            <svg viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle
                    stroke="#8e96aa"
                    className="loader-circle"
                    cx="9.5"
                    cy="9.5"
                    r="7.5"
                    strokeOpacity="0.5"
                    strokeWidth="2.5"
                />
                <path
                    stroke="#457ced"
                    className="loader-focus"
                    d="M9.5 17C5.35786 17 2 13.6421 2 9.5"
                    strokeWidth="2.5"
                />
            </svg>
        </div>
    );
};

// Loader.propTypes = {
//     width: PropTypes.string,
//     height: PropTypes.string,
//     style: PropTypes.object,
// };

export default Loader;
