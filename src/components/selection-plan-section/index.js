import React, {useEffect} from 'react';
import {connect} from 'react-redux';
import T from 'i18n-react/dist/i18n-react';
import Swal from "sweetalert2";
import {getAllPresentations} from '../../actions/presentations-actions';
import {deletePresentation, resetPresentation} from '../../actions/presentation-actions';
import { getSelectionPlan } from '../../actions/base-actions';
import PresentationsTable from "../../components/presentations-table";
import '../../styles/presentations-page.less';


const SelectionPlanSection = ({summit, selectionPlan, loggedSpeaker, loading, ...props }) => {

  useEffect(() => {
    console.log('USE EFFECT SEL PLAN SEC', selectionPlan.id);

    props.getAllPresentations(summit.id, selectionPlan.id).then(() => {
      // clear presentation form
      props.resetPresentation();
    });
  }, [summit?.id, selectionPlan?.id]);

  const handleNewPresentation = (ev) => {
    const {history, match} = props;
    ev.preventDefault();
    history.push(`${match.url}/new/summary`);
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
    submissionIsClosed,
    match,
    history
  } = props;

  if (loading || summit == null || loggedSpeaker == null) return null;

  const thisPlanCreated = presentations_created.find(sp => sp.selectionPlanId === selectionPlan.id)?.presentations || [];
  const thisPlanSpeaker = presentations_speaker.find(sp => sp.selectionPlanId === selectionPlan.id)?.presentations || [];
  const thisPlanModerator = presentations_moderator.find(sp => sp.selectionPlanId === selectionPlan.id)?.presentations || [];

  return (
    <div className="page-wrap" id="presentations-page">
      <div className="header">
        <div className="row">
          <div className="col-md-6 your-title">
            <h2> {T.translate("presentations.presentations")}</h2>
          </div>
          <div className="col-md-6 text-right add-pres-wrapper">
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
          onDelete={handleDeletePresentation}
          canEdit
          history={history}
          match={match}
        />
        <PresentationsTable
          title={T.translate("presentations.other_submitted_speaker")}
          presentations={thisPlanSpeaker}
          history={history}
          match={match}
        />
        <PresentationsTable
          title={T.translate("presentations.other_submitted_moderator")}
          presentations={thisPlanModerator}
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
  submissionIsClosed: baseState.submissionIsClosed,
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