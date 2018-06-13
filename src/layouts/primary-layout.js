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
import { Breadcrumbs, Breadcrumb } from 'react-breadcrumbs'
import NavMenu from '../components/nav-menu/index'

class PrimaryLayout extends React.Component {

  render(){
    let { match, location } = this.props;
    let extraClass = 'container';

    // full width pages
    /*
    if (location.pathname.includes('')) {
      extraClass = '';
    }
    */

    let useMenu = false;
    
    return(
      <div className="primary-layout">
        { useMenu && <NavMenu /> }
        <main id="page-wrap">
          <Breadcrumbs className={"breadcrumbs-wrapper " + extraClass} separator="/" />
          <Breadcrumb data={{ title: <i className="fa fa-home"></i>, pathname: match.url }} ></Breadcrumb>
          <Switch>
            {/* add here your main routes
              ex: <Route exact path="/app/directory" component={SummitDirectoryPage}/>
             */}
          </Switch>
        </main>
      </div>
    );
  }

}

const mapStateToProps = ({  }) => ({

})

export default connect(mapStateToProps, {})(PrimaryLayout)


