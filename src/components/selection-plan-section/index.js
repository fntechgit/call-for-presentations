import React, {useEffect, useState} from 'react';
import {connect} from 'react-redux';
import T from 'i18n-react/dist/i18n-react';
import Swal from "sweetalert2";
import {getAllPresentations} from '../../actions/presentations-actions';
import {deletePresentation, resetPresentation} from '../../actions/presentation-actions';
import PresentationsTable from "../../components/presentations-table";
import {formatEpoch} from "openstack-uicore-foundation/lib/utils/methods";
import moment from "moment-timezone";
import {nowBetween} from "../../utils/methods";
import './selection-plan-section.less';


const SelectionPlanSection = ({summit, selectionPlan, selectionPlanSettings, loggedSpeaker, baseLoaded, loading, ...props }) => {
  const [dataPulled, setDataPulled] = useState(false);
  useEffect(() => {
    props.getAllPresentations(summit.id, selectionPlan.id).then(() => {
      // clear presentation form
      props.resetPresentation();
      setDataPulled(true);
    });
  }, [summit?.id, selectionPlan?.id]);

  const handleNewPresentation = (ev) => {
    const {history} = props;
    let url = `/app/${summit.slug}/all-plans/${selectionPlan.id}/presentations/new/summary`;
    console.log(url);
    ev.preventDefault();
    history.push(url);
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
    ev.preventDefault();

    Swal.fire({
      title: T.translate("general.are_you_sure"),
      text: T.translate("presentations.remove_warning", {
        presentation: selectionPlanSettings?.CFP_PRESENTATIONS_SINGULAR_LABEL || T.translate("edit_presentation.presentation").toLowerCase()
      }) + ' ' + presentation.title,
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
  const submittedCount = presentationsCreated.length + presentationsSpeaker.length + presentationsModerator.length;
  const maxReached = submittedCount >= selectionPlan?.max_submission_allowed_per_user;
  const canAddNew = !submissionIsClosed && selectionPlan?.allow_new_presentations && !maxReached;

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
              {T.translate("presentations.add_presentation", {presentation: `${selectionPlanSettings?.CFP_PRESENTATIONS_SINGULAR_LABEL || T.translate("edit_presentation.presentation")}`})}
            </button>
            }
            {maxReached &&
            <p>Max submissions ({selectionPlan?.max_submission_allowed_per_user}) reached.</p>
            }
          </div>
        </div>
      </div>
      <div className="body">
        <PresentationsTable
          title={T.translate("presentations.you_submitted", {presentations: `${selectionPlanSettings?.CFP_PRESENTATIONS_PLURAL_LABEL || T.translate("edit_presentation.presentations")}`})}
          presentations={presentationsCreated}
          selectionPlan={selectionPlan}
          selectionPlanSettings={selectionPlanSettings}
          onDelete={handleDeletePresentation}
          canEdit
          history={history}
          match={match}
        />
        <PresentationsTable
          title={T.translate("presentations.other_submitted_speaker", {
            presentations: `${selectionPlanSettings?.CFP_PRESENTATIONS_PLURAL_LABEL || T.translate("edit_presentation.presentations")}`,
            speaker: `${selectionPlanSettings?.CFP_SPEAKERS_SINGULAR_LABEL || 'Speaker'}`
          })}
          presentations={presentationsSpeaker}
          selectionPlan={selectionPlan}
          selectionPlanSettings={selectionPlanSettings}
          history={history}
          match={match}
        />
        <PresentationsTable
          title={T.translate("presentations.other_submitted_moderator", {presentations: `${selectionPlanSettings?.CFP_PRESENTATIONS_PLURAL_LABEL || 'Presentations'}`})}
          presentations={presentationsModerator}
          selectionPlan={selectionPlan}
          selectionPlanSettings={selectionPlanSettings}
          history={history}
          match={match}
        />
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
