import React, { Component } from 'react';

import { connect } from "react-redux";

import NavigationBar from "../NavigationBar";

import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Translator from "../utils/Translator";

import { changeApiUrl } from "../../actions/api.action";

import Utilities from "../../utils/Utilities";

import Cookies from "universal-cookie";

const cookies = new Cookies();

const mapStateToProps = (state: any) => {
    return { api_url: state.api_url, token: state.token };
};

function mapDispatchToProps(dispatch: any) {
    return { changeApiUrl: (token: object) => dispatch(changeApiUrl(token)) };
}

interface Props {
    api_url: string,
    history: {
        push: any
    },
    token: string,
    changeApiUrl: any
}

interface State {
    displayedMessage: string
}

class EmailValidation extends Component<Props, State> {
    state: State = {
        displayedMessage: (this.props.token) ? 'emailValidatedButConnected' : 'emailValidated'
    };

    /**
     * Fetch the token and the API URL inside the query parameter of the URL
     *  -   Set the new API URL for security
     *  -   Save the token then make a PATCH request to validate the email
     */
    componentDidMount(): void {
        if (this.props.token) {
            return;
        }

        let token : string | null = Utilities.getQueryParameter(window.location.href, 'token');
        const newApiUrl: string | null = Utilities.getQueryParameter(window.location.href, 'api_url');

        this.props.changeApiUrl(newApiUrl);
        cookies.set('api_url', newApiUrl);

        fetch(`${newApiUrl}/users/validate?token=${token}`, {
            method: 'PATCH',
        }).then((res) => {
            return res.json();
        }).then((data) => {
            console.log(data);
        });
    }

    render() {
        return (
            <div>
                <NavigationBar history={this.props.history} />
                <Grid
                    container
                    spacing={0}
                    direction='column'
                    alignItems='center'
                    justify='center'
                    style={{ marginTop: '-50px', minHeight: '100vh', textAlign: 'center' }}
                >
                    <Grid item xs={6}>
                        <Typography variant="h4" gutterBottom>
                            <Translator sentence={this.state.displayedMessage} />
                        </Typography>
                    </Grid>
                </Grid>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(EmailValidation);
