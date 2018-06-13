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

import React from 'react'
import { connect } from 'react-redux';
import { Switch, Route, Redirect } from 'react-router-dom';
import NavMenu from '../components/nav-menu/index'

class PrimaryLayout extends React.Component {

  render(){
    let { match, location, member } = this.props;
    let extraClass = 'container';

    // full width pages
    /*
    if (location.pathname.includes('')) {
      extraClass = '';
    }
    */

    return(
      <div className="primary-layout container-fluid">
        <div className="row">
          <div className="col-md-3">
            <NavMenu user={member} />
          </div>
          <div className="col-md-9">
            <main id="page-wrap">
              <Switch>
                {/* add here your main routes
                  ex: <Route exact path="/app/directory" component={SummitDirectoryPage}/>
                 */}
              </Switch>
            </main>
          </div>
        </div>
      </div>
    );
  }

}

const mapStateToProps = ({ loggedUserState }) => ({
  member: loggedUserState.member
})

export default connect(mapStateToProps, {})(PrimaryLayout)


