import React, {useEffect} from 'react';
import {connect} from 'react-redux';
import T from 'i18n-react/dist/i18n-react';
import Swal from "sweetalert2";
import {getAllPresentations} from '../../actions/presentations-actions';
import {deletePresentation, resetPresentation} from '../../actions/presentation-actions';
import { getSelectionPlan } from '../../actions/base-actions';
import PresentationsTable from "../../components/presentations-table";
import './selection-plan-section.less';
import {formatEpoch} from "openstack-uicore-foundation/lib/utils/methods";
import moment from "moment-timezone";
import {nowBetween} from "../../utils/methods";


const SelectionPlanSection = ({summit, selectionPlan, loggedSpeaker, loading, ...props }) => {

  useEffect(() => {
    props.getAllPresentations(summit.id, selectionPlan.id).then(() => {
      // clear presentation form
      props.resetPresentation();
    });
  }, [summit?.id, selectionPlan?.id]);

  const handleNewPresentation = (ev) => {
    const {history, match} = props;
    ev.preventDefault();
    history.push(`${match.url}/${selectionPlan.id}/presentations/new/summary`);
  }

  const getTitle = (submissionIsClosed) => {
    let title = '';
    let subtitle = '';

    const end_date = formatEpoch( selectionPlan.submission_end_date, "MMMM DD, YYYY h:mm a");

    if (title !== "") title += ": ";
    title += selectionPlan.name;


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

  const {
    presentations_created,
    presentations_speaker,
    presentations_moderator,
    match,
    history
  } = props;

  if (loading || summit == null || selectionPlan == null || loggedSpeaker == null) return null;

  const thisPlanCreated = presentations_created.find(sp => sp.selectionPlanId === selectionPlan.id)?.presentations || [];
  const thisPlanSpeaker = presentations_speaker.find(sp => sp.selectionPlanId === selectionPlan.id)?.presentations || [];
  const thisPlanModerator = presentations_moderator.find(sp => sp.selectionPlanId === selectionPlan.id)?.presentations || [];
  const submissionIsClosed = !nowBetween(selectionPlan.submission_begin_date, selectionPlan.submission_end_date);
  const {title, subtitle} = getTitle(submissionIsClosed);

  return (
    <div className="page-wrap" id="selection-plan-section">
      <div className="header">
        <div className="row">
          <div className="col-md-8 your-title">
            <h2>{title}</h2>
            <span>{subtitle}</span>
          </div>
          <div className="col-md-4 text-right add-pres-wrapper">
            {!submissionIsClosed && selectionPlan && selectionPlan.allow_new_presentations &&
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
          presentations={thisPlanCreated}
          selectionPlan={selectionPlan}
          onDelete={handleDeletePresentation}
          canEdit
          history={history}
          match={match}
        />
        <PresentationsTable
          title={T.translate("presentations.other_submitted_speaker")}
          presentations={thisPlanSpeaker}
          selectionPlan={selectionPlan}
          history={history}
          match={match}
        />
        <PresentationsTable
          title={T.translate("presentations.other_submitted_moderator")}
          presentations={thisPlanModerator}
          selectionPlan={selectionPlan}
          history={history}
          match={match}
        />
      </div>

    </div>
  );
};

const mapStateToProps = ({presentationsState, baseState}) => ({
  summit: baseState.summit,
  presentations_created: presentationsState.presentations_created,
  presentations_speaker: presentationsState.presentations_speaker,
  presentations_moderator: presentationsState.presentations_moderator,
  loggedSpeaker: baseState.speaker,
  loading: baseState.loading,
})

export default connect(
  mapStateToProps,
  {
    getAllPresentations,
    deletePresentation,
    resetPresentation,
    getSelectionPlan,
  }
)(SelectionPlanSection);