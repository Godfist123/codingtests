import { useState } from 'react';
import DropDown from '../../Components/DropDown';
import ProgressBar from '../../Components/ProgressBar';
import Loader from '../../Components/Loader';

import { useAnimationFrame } from '../../Hooks/useAnimationFrame';

import classes from './Rates.module.css';

import CountryData from '../../Libs/Countries.json';
import countryToCurrency from '../../Libs/CountryCurrency.json';

let countries = CountryData.CountryCodes;

const Rates = () => {
    const [fromCurrency, setFromCurrency] = useState('AU');
    const [toCurrency, setToCurrency] = useState('US');

    const [exchangeRate, setExchangeRate] = useState(0.7456);
    const [progression, setProgression] = useState(0);
    const [loading, setLoading] = useState(false);

    const Flag = ({ code }: { code: string }) => (
        <img alt={code || ''} src={`/img/flags/${code || ''}.svg`} width="20px" className={classes.flag} />
    );

    const fetchData = async () => {
        if (!loading) {
            setLoading(true);

            await new Promise((resolve) => setTimeout(resolve, 2000));

            setLoading(false);
        }
    };

    // Demo progress bar moving :)
    useAnimationFrame(!loading, (deltaTime) => {
        setProgression((prevState) => {
            if (prevState > 0.998) {
                fetchData();
                return 0;
            }
            return (prevState + deltaTime * 0.0001) % 1;
        });
    });

    return (
        <div className={classes.container}>
            <div className={classes.content}>
                <div className={classes.heading}>Currency Conversion</div>

                <div className={classes.rowWrapper}>
                    <div>
                        <DropDown
                            leftIcon={<Flag code={fromCurrency} />}
                            label={'From'}
                            selected={countryToCurrency[fromCurrency as keyof typeof countryToCurrency]}
                            options={countries.map(({ code }) => ({
                                option: countryToCurrency[code as keyof typeof countryToCurrency],
                                key: code,
                                icon: <Flag code={code} />,
                            }))}
                            setSelected={(key: string) => {
                                setFromCurrency(key);
                            }}
                            style={{ marginRight: '20px' }}
                        />
                    </div>

                    <div className={classes.exchangeWrapper}>
                        <div className={classes.transferIcon}>
                            <img src="/img/icons/Transfer.svg" alt="Transfer icon" />
                        </div>

                        <div className={classes.rate}>{exchangeRate}</div>
                    </div>

                    <div>
                        <DropDown
                            leftIcon={<Flag code={toCurrency} />}
                            label={'To'}
                            selected={countryToCurrency[toCurrency as keyof typeof countryToCurrency]}
                            options={countries.map(({ code }) => ({
                                option: countryToCurrency[code as keyof typeof countryToCurrency],
                                key: code,
                                icon: <Flag code={code} />,
                            }))}
                            setSelected={(key: string) => {
                                setToCurrency(key);
                            }}
                            style={{ marginLeft: '20px' }}
                        />
                    </div>
                </div>

                <ProgressBar
                    progress={progression}
                    animationClass={loading ? classes.slow : ''}
                    style={{ marginTop: '20px' }}
                />

                {loading && (
                    <div className={classes.loaderWrapper}>
                        <Loader width={'25px'} height={'25px'} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Rates;
