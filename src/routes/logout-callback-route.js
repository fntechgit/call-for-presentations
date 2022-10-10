/**
 * Copyright 2018 OpenStack Foundation
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/
import URI from "urijs"
import React from 'react'
import {withRouter} from 'react-router-dom'
import {connect} from "react-redux";

class LogOutCallbackRoute extends React.Component {


  constructor(props) {
    super(props);

    this.state = {
      error: null
    };
  }

  componentWillMount() {
    const {doLogout, location, history, summit} = this.props;
    const query = URI.parseQuery(location.search);
    const storedState = window.localStorage.getItem('post_logout_state');

    window.localStorage.removeItem('post_logout_state');

    if (!query.hasOwnProperty("state")) {
      this.setState({...this.state, error: 'Missing State.'});
      return;
    }

    if (query["state"] !== storedState) {
      this.setState({...this.state, error: 'Invalid State.'});
      return;
    }

    doLogout();

    if (summit?.slug) {
      history.push(`/app/${summit.slug}`);
      return;
    }

    history.push("/");
  }


  render() {
    if (this.state.error != null) {
      return (<p>{this.state.error}</p>)
    }
    return null;
  }
}

const mapStateToProps = ({baseState}) => ({
  summit: baseState.summit,
})

export default withRouter(connect(mapStateToProps)(LogOutCallbackRoute));

