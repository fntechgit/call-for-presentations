import React, {useEffect, useState} from 'react';
import {connect} from 'react-redux';
import T from 'i18n-react/dist/i18n-react';
import Swal from "sweetalert2";
import {getAllPresentations} from '../../actions/presentations-actions';
import {deletePresentation, resetPresentation} from '../../actions/presentation-actions';
import PresentationsTable from "../../components/presentations-table";
import SummitDocsSection from "../../components/summit-docs-section";
import {formatEpoch} from "openstack-uicore-foundation/lib/utils/methods";
import moment from "moment-timezone";
import {nowBetween} from "../../utils/methods";
import './selection-plan-section.less';


const SelectionPlanSection = ({summit, selectionPlan, loggedSpeaker, baseLoaded, loading, ...props }) => {
  const [dataPulled, setDataPulled] = useState(false);

  useEffect(() => {
    props.getAllPresentations(summit.id, selectionPlan.id).then(() => {
      // clear presentation form
      props.resetPresentation();
      setDataPulled(true);
    });
  }, [summit?.id, selectionPlan?.id]);

  const handleNewPresentation = (ev) => {
    const {history, match} = props;
    const {params} = match;
    const {selection_plan_id} = params;
    let url = match.url;
    const segments = [];
    if (!selection_plan_id)
      url = `${url}/${selectionPlan.id}`;
    ev.preventDefault();
    history.push(`${url}/presentations/new/summary`);
  }

  const getTitle = (submissionIsClosed) => {
    const end_date = formatEpoch(selectionPlan.submission_end_date, "MMMM DD, YYYY h:mm a");
    const title = selectionPlan.name;
    let subtitle = '';

    if (submissionIsClosed) {
      subtitle = T.translate("landing.closed");
    } else {
      subtitle = T.translate("landing.subtitle", {
        end_date: end_date,
        when: moment.tz.guess(),
      });
      }
    return {title, subtitle};
  }

  const handleDeletePresentation = (ev, presentation) => {
    const {deletePresentation} = props;
    debugger;
    ev.preventDefault();

    Swal.fire({
      title: T.translate("general.are_you_sure"),
      text: T.translate("presentations.remove_warning") + ' ' + presentation.title,
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: T.translate("general.yes_delete")
    }).then(function (result) {
      if (result.value) {
        deletePresentation(selectionPlan.id, presentation.id);
      }
    });
  };

  if (!dataPulled) return null;

  const { collections, match, history } = props;
  const thisPlan = collections.find(col => col.selectionPlan.id === selectionPlan.id);

  if (!thisPlan) return null;

  const {presentationsCreated, presentationsSpeaker, presentationsModerator, summitDocs} = thisPlan;
  const submissionIsClosed = !nowBetween(selectionPlan.submission_begin_date, selectionPlan.submission_end_date);
  const {title, subtitle} = getTitle(submissionIsClosed);
  const canAddNew = !submissionIsClosed && selectionPlan && selectionPlan.allow_new_presentations;

  return (
    <div className="page-wrap" id="selection-plan-section">
      <div className="header">
        <div className="row">
          <div className="col-md-8 your-title">
            <h2>{title}</h2>
            <span>{subtitle}</span>
          </div>
          <div className="col-md-4 text-right add-pres-wrapper">
            {canAddNew &&
            <button className="btn btn-success add-presentation-btn" onClick={handleNewPresentation}>
              {T.translate("presentations.add_presentation")}
            </button>
            }
          </div>
        </div>
      </div>
      <div className="body">
        <PresentationsTable
          title={T.translate("presentations.you_submitted")}
          presentations={presentationsCreated}
          selectionPlan={selectionPlan}
          onDelete={handleDeletePresentation}
          canEdit
          history={history}
          match={match}
        />
        <PresentationsTable
          title={T.translate("presentations.other_submitted_speaker")}
          presentations={presentationsSpeaker}
          selectionPlan={selectionPlan}
          history={history}
          match={match}
        />
        <PresentationsTable
          title={T.translate("presentations.other_submitted_moderator")}
          presentations={presentationsModerator}
          selectionPlan={selectionPlan}
          history={history}
          match={match}
        />
        <SummitDocsSection summitDocs={summitDocs} />
      </div>

    </div>
  );
};

const mapStateToProps = ({presentationsState, baseState}) => ({
  summit: baseState.summit,
  collections: presentationsState.collections,
  loggedSpeaker: baseState.speaker,
  loading: baseState.loading,
})

export default connect(
  mapStateToProps,
  {
    getAllPresentations,
    deletePresentation,
    resetPresentation,
  }
)(SelectionPlanSection);