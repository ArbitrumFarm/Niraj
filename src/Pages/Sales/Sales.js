import React, { useEffect, useState } from "react";
import Alert from "react-bootstrap/Alert";
import { Range, getTrackBackground } from "react-range";
import axios from "axios";
import logo from "../../assets/header/newLogo.svg";
import image from "../../assets/sales/image.png";
import discordFooter from "../../assets/footer/discord.svg";
import twitterFooter from "../../assets/footer/twitter.svg";
import instagram from "../../assets/header/instagram.svg";
import mobileErrorIcon from "../../assets/sales/mobileError.svg";
import connectArrow from "../../assets/sales/connectArrow.svg";
import newLogo from "../../assets/sales/logo.png";
import "./Sales.scss";
import { TokenAbis } from "../../abis/TokenAbis";
const { ethereum } = window;
const Web3 = require("web3");

const STEP = 1;
const MIN = 1;
const MAX = 20;

const NFTAddress = "0x59d978047076ace97dcbb562b57370dfea3498a3";
const amountMultiply = 20000000000000000;
const chainAddress = "0x4";
const saleTime = "Aug 12, 2021 17:00:00";

var refrestRewardTokenTimeInterval;

export default function Sales(props) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [values, setValues] = React.useState([1]);
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [isConnected, setIsConnected] = React.useState(false);
  const [saleStarted, setSaleStarted] = React.useState(false);
  const [disableMintButton, setDisableMintButton] = React.useState(false);
  const [disableMintButtonAfterSaleOver, setDisableMintButtonAfterSaleOver] =
    React.useState(false);
  const [countDownDate, setCountDownDate] = React.useState("");
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [isError, setIsError] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [successMessage, setSuccessMessage] = React.useState("");
  const [userAddress, setUserAddress] = React.useState("");
  const [wrongNetworkError, setWrongNetworkError] = useState(false);

  let contract = null;
  let methods = null;

  useEffect(() => {
    checkWalletConnectedOnPageLoad();
    startCountDown();
  }, []);

  const convertIntoNumberFormat = (amount) => {
    //let value = Number(amount).toFixed().replace(/\d(?=(\d{3})+\.)/g,'$&,');
    return Math.trunc(amount);
  };

  const calcTime = () => {
    let d = new Date();
    let utc = d.getTime() + d.getTimezoneOffset() * 60000;
    let nd = new Date(utc).getTime();
    return nd;
  };

  const startCountDown = () => {
    var countDownDate = new Date(saleTime).getTime();
    var x = setInterval(() => {
      var now = calcTime();
      // var now = new Date().getTime();
      var distance = countDownDate - now;
      var days = Math.floor(distance / (1000 * 60 * 60 * 24));
      var hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      var seconds = Math.floor((distance % (1000 * 60)) / 1000);

      let timeLeft =
        days + "d " + hours + "h " + minutes + "m " + seconds + "s";
      setCountDownDate(timeLeft);
      if (distance < 0) {
        clearInterval(x);
        setCountDownDate("Sale Already Started");
        setSaleStarted(true);
      }
    }, 10);
  };

  async function loadContract() {
    return await new window.web3.eth.Contract(TokenAbis, NFTAddress);
  }

  const checkWalletConnectedOnPageLoad = async () => {
    if (ethereum) {
      await ethereum.request({ method: "eth_accounts" }).then((response) => {
        getChainId(response);
      });
    } else {
    }
  };

  const connectToMetaMask = async () => {
    if (ethereum) {
      setIsConnecting(true);
      await ethereum.request({ method: "eth_requestAccounts" }).then(
        (response) => {
          setIsConnecting(false);
          getChainId(response);
        },
        (error) => {
          setIsConnecting(false);
          setErrorAlertStatus(true, error?.message);
        }
      );
    } else {
      setErrorAlertStatus(true, "Metamask not installed in your browser.");
      return false;
    }
  };

  const checkWalletConnected = (e) => {
    if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
      window.ethereum.enable();
      return true;
    }
    return false;
  };

  const mintAToken = async () => {
    if (!saleStarted) {
      return;
    }
    setDisableMintButton(true);
    checkWalletConnected();
    const contract = await loadContract();
    const methods = await contract.methods;
    methods
      .mintArbiMAYC(values)
      .send({
        from: window.web3.currentProvider.selectedAddress,
        value: Number(values) * amountMultiply,
      })
      .then(
        (response) => {
          setSuccessAlertStatus(
            true,
            "You have successfully bought " + values + " ArbiBoredApeYachtClub"
          );
          setDisableMintButton(false);
        },
        (error) => {
          setErrorAlertStatus(true, error?.message);
          setDisableMintButton(false);
        }
      );
  };

  const [pageNumber, setPageNumber] = React.useState(-1);
  const [disableLoadMoreButton, setDisableLoadMoreButton] =
    React.useState(false);

 


  const setErrorAlertStatus = (status, message) => {
    setIsError(status);
    setErrorMessage(message);
    setTimeout(function () {
      setIsError(false);
    }, 4000);
  };

  const setSuccessAlertStatus = (status, message) => {
    setIsSuccess(status);
    setSuccessMessage(message);
    setTimeout(function () {
      setIsSuccess(false);
    }, 4000);
  };

  ethereum?.on("chainChanged", (_chainId) => {
    window.location.reload();
  });

  ethereum?.on("accountsChanged", (accounts) => {
    if (accounts.length === 0) {
      clearInterval(refrestRewardTokenTimeInterval);
      setIsConnected(false);
      setUserAddress("");
    } else {
      window.location.reload();
    }
  });

  const getChainId = async (userAddress) => {
    ethereum.request({ method: "eth_chainId" }).then((response) => {
      console.log(response);
      if (response === chainAddress) {
        setIsConnected(userAddress.length === 0 ? false : true);
      } else {
        if (userAddress.length > 0) {
          setWrongNetworkError(true);
        }
      }
    });
  };

  return (
    <React.Fragment>
      <div className="salesPage">
        {isLoading && (
          <div className="loadingIndicator">
            <img src={newLogo} className="connectingLogo" alt="logo" />
          </div>
        )}
        <div className={"NavBarNew fixed"}>
          <div className="brandLogo">
            <a href="/">
              <img src={newLogo} className="logo" alt="logo" />
            </a>
            <div className={"brandName"}>ArbiBAYC</div>
          </div>
          <div className="socialIcons">
            <ul>
              {userAddress !== "" && (
                <li>
                  <button className="connectButton">{userAddress}</button>
                </li>
              )}

              <li>
                <a
                  href=""
                  target="_blank"
                  rel="noreferrer"
                >
                  <img src={discordFooter} alt="discord" />
                </a>
              </li>
              <li>
                <a
                  href=""
                  target="_blank"
                  rel="noreferrer"
                >
                  <img src={twitterFooter} alt="twitter" />
                </a>
              </li>
              <li className="youtubeIcon">
                <a
                  href=""
                  target="_blank"
                  rel="noreferrer"
                >
                  <img src={instagram} alt="instagram" />
                </a>
              </li>
            </ul>
          </div>
        </div>
        {/*NavBar END*/}
        <Alert show={isSuccess} variant="success">
          {successMessage}
        </Alert>
        <Alert show={isError} variant="danger">
          {errorMessage}
        </Alert>
        <div className="heroSection container">
          <img src={image} className="heroImage" alt="heroImage" />

          <h1>BUY A ARBIBAYC</h1>

          <p>
            Become a Citizen of ArbiBAYC for just .02{" "}
            <span className="ethSymbol">??</span>
          </p>

          {wrongNetworkError && (
            <div className="wrongNetworkError">
              Please connect to Ethereum Mainnet
            </div>
          )}

          {!isConnected ? (
            <div className="connectButtonSection">
              {!saleStarted ? (
                <div className="saleButton mb-3">
                  Sale starts in <b>{countDownDate}</b>
                </div>
              ) : (
                ""
              )}
              {wrongNetworkError ? (
                <button className="wrongNetworkButton">Wrong Network</button>
              ) : (
                <React.Fragment>
                  <button className="connectButton" onClick={connectToMetaMask}>
                    {isConnecting ? (
                      <React.Fragment>
                        Connecting Wallet <div className="loadingDots"></div>
                      </React.Fragment>
                    ) : (
                      <React.Fragment>
                        Connect Wallet{" "}
                        <img
                          src={connectArrow}
                          className="connectArrow"
                          alt="arrow"
                        />{" "}
                      </React.Fragment>
                    )}
                  </button>
                </React.Fragment>
              )}

              <span className="mobileView">
                {/*<div className="mobileConnectError">
                      <img src={mobileErrorIcon} className="icon" alt="errorIcon"/>
                      Please use web version to mint tokens
                    </div>*/}
                <div className="mobileSocialIcons">
                  <ul>
                    <li>
                      <a
                        href=""
                        target="_blank"
                        rel="noreferrer"
                      >
                        <img src={discordFooter} alt="discord" />
                      </a>
                    </li>
                    <li>
                      <a
                        href=""
                        target="_blank"
                        rel="noreferrer"
                      >
                        <img src={twitterFooter} alt="twitter" />
                      </a>
                    </li>
                    <li className="youtubeIcon">
                      <a
                        href=""
                        target="_blank"
                        rel="noreferrer"
                      >
                        <img src={instagram} alt="instagram" />
                      </a>
                    </li>
                  </ul>
                </div>
              </span>
            </div>
          ) : (
            <div className="mintTokenSection">
              <div className="rangeSection">
                Let me get
                <span className="count">
                  <input
                    value={values[0]}
                    minimum="1"
                    onInput={(e) =>
                      setValues([
                        e.target.value > 20 ? 20 : Number(e.target.value),
                      ])
                    }
                    type="text"
                    className="amountField"
                  />
                </span>
                <div className="rangeSlider">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <Range
                      values={values}
                      step={STEP}
                      min={MIN}
                      max={MAX}
                      onChange={(values) => setValues(values)}
                      renderTrack={({ props, children }) => (
                        <div
                          onMouseDown={props.onMouseDown}
                          style={{
                            ...props.style,
                            height: "40px",
                            display: "flex",
                            width: "200px",
                          }}
                        >
                          <div
                            ref={props.ref}
                            style={{
                              height: "15px",
                              width: "100%",
                              borderRadius: "50px",
                              border: "0px solid #0d41a5",
                              background: getTrackBackground({
                                values,
                                colors: ["rgba(102, 105, 224, 1)", "#ffffff"],
                                min: MIN,
                                max: MAX,
                              }),
                              alignSelf: "center",
                            }}
                          >
                            {children}
                          </div>
                        </div>
                      )}
                      renderThumb={({ props, isDragged }) => (
                        <div
                          {...props}
                          style={{
                            ...props.style,
                            height: "30px",
                            width: "30px",
                            borderRadius: "50%",
                            backgroundColor: "#5a61f9",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            boxShadow: "0px 0px 0px #AAA",
                            border: "solid 2px #5a61f9",
                            opacity: 1,
                          }}
                        >
                          <div
                            style={{
                              height: "16px",
                              width: "0px",
                              backgroundColor: isDragged
                                ? "red"
                                : "rgba(102, 105, 224, 1)",
                            }}
                          />
                        </div>
                      )}
                    />
                  </div>
                </div>
                ArbiBayc{values > 1 && "s"} for <span> {values * 0.02} </span>
                <span className="ethSymbol">??</span>
              </div>
              {disableMintButtonAfterSaleOver ? (
                <button
                  className="connectButton"
                  disabled={true}
                  onClick={mintAToken}
                >
                  Mint
                </button>
              ) : (
                <button
                  className="connectButton"
                  disabled={values[0] <= 0 || !saleStarted || disableMintButton}
                  onClick={mintAToken}
                >
                  {!disableMintButton ? (
                    "Mint"
                  ) : (
                    <React.Fragment>
                      Minting <div className="loadingDots"></div>
                    </React.Fragment>
                  )}
                </button>
              )}
              {/* {disableMintButtonAfterSaleOver && <div className="saleButton">Presale is over.</div>} */}
              {!saleStarted ? (
                <div className="saleButton">
                  Sale starts in <b>{countDownDate}</b>
                </div>
              ) : (
                ""
              )}
            </div>
          )}
        </div>
        <div className="container">
            
          <div className="row aboutSection">
            <div className="col-12 titleSection">
              <h1>Arbitrum BAYC</h1>
              <h2>
                Be a MAYC holder on Arbitrum
              </h2>
            </div>
            
              <div className="col-12 col-md-6 middleSection">
                
                <h2>
                  <b>
                    We are a fork of the official MAYC project on arbitrum with a fantastic roadmap ahead.
                  </b>
                </h2>
                
                <h2 class="h3Tag">
                  <b>
                    Our ArbiMAYC NFT's are community lead and will bring the first main stream NFT's to Arbitrum
                  </b>
                </h2>
                
                <h2 class="h3Tag">
                  <b>
                    Holding ArbiMAYC not only gives you access to the first MAYC project on Arbitrum, but provides you with exclusive rewards and benefits that increase over time.
                  </b>
                </h2>
                
                <div className="paragraph">
                  <b>
                    We plan on dedicating:
                  </b>
                </div>
                
                <div className="paragraph1">
                  <b>
                    30% of the funds for marketing and to onboard influencers.
                  </b>
                </div>
                
                <div className="paragraph1">
                  <b>
                    20% for giveaways to increase the community
                  </b>
                </div>
                
                <div className="paragraph1">
                  <b>
                    10% will be for our treasury need
                  </b>
                </div>
                
                <div className="paragraph1">
                  <b>
                    50% to build exclusive membership benefits for our community
                  </b>
                </div>
                
                <div className="paragraph2">
                  <b>
                    You will be able to trade your ArbiBAYC as soon as Opensea releases its Arbitrum L2
                  </b>
                </div>
                
                <div className="paragraph2">
                  <b>
                    Trading in our Disord will be available soon.
                  </b>
                </div>
                
              </div>
              <div className="col-12 col-md-6">
                <img src="assets/2.gif" className="gif"/>
              </div>
          </div>

          <div className="FAQSection">

            <div className="title"> FAQ </div>
              <div className="questions">
                <h1>
                  How many ArbiMAYC will be released ?
                </h1>
                <p>
                  We will be relasing 20,000 MAYC exactly as the official collection
                </p>
              </div>

              <div className="questions">
                <h1>
                  How to Buy ?
                </h1>
                <p>
                  Buying ArbiMAYC is very easy.<br/>
                  Connect your wallet and choose how many ArbiMAYC you want to buy (maximum 20 per tx). Each ArbiMAYC cost is 0.02 ETH.
                </p>
              </div>
            
          </div>

           <div className="roadmapSection">

            <div className="title"> ArbiBAYC Roadmap </div>
            
            <div className="roadmapItem">
              <div className="firstItem">
                <div className="itemBox">
                  1
                </div>
                <div className="itemContent">
                  <h3>
                    Q3 2021
                  </h3>
                  <h4>
                    Launch 10,000 ArbiMAYC
                  </h4>
                  <h4>
                    Initial Marketing Campaign<br/>
                    Onboard influencers<br/>
                    Organize first community benefits
                  </h4>
                </div>
              </div>

              <div className="firstItem">
                <div className="itemBox">
                  2
                </div>
                <div className="itemContent">
                  <h3>
                      Q4 2021
                  </h3>
                  <p>
                    Launch on Opensea L2
                  </p>
                  <p>
                    Expand community benefits
                  </p>
                  <p>
                    Release Goodies
                  </p>
                </div>
              </div>

              <div className="firstItem">
                <div className="itemBox">
                  3
                </div>
                <div className="itemContent">
                  <h3>
                      Q1 2022
                  </h3>
                  <p>
                    Artists and influencers engagement
                  </p>
                  <p>
                    Community benefits
                  </p>
                </div>
              </div>

            </div>
            
          </div>

          <div className="joinUsSection">
            <div className="title">
              Join us on Telegram
            </div>
            <a href="https://t.me/ArbiMAYC" target="_blank">
              <img src="assets/telegram.png" className="telegramIcon" />
            </a>

          </div>

        </div>

        {/*heroSection END*/}
      </div>
    </React.Fragment>
  );
}
