import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { STANDARDS } from '../util';

import { t } from '../i18n';
import { updateActivity as updateActivityAction } from '../actions/activities';
import Collapsible from '../components/Collapsible';
import { Textarea } from '../components/Inputs2';

class ActivityDetailStandardsAndConditions extends Component {
  handleChange = key => e => {
    const { value } = e.target;
    const { activity, updateActivity } = this.props;

    const updates = { standardsAndConditions: { [key]: value } };
    updateActivity(activity.id, updates);
  };

  render() {
    const { activity } = this.props;

    return (
      <Collapsible title={t('activities.standardsAndConditions.title')}>
        <p>{t('activities.standardsAndConditions.subheader')}</p>
        {STANDARDS.map(std => {
          const inputId = `a-${activity.id}-standards-${std.id}`;
          return (
            <div key={std.id}>
              <h3>
                {t([`activities.standardsAndConditions`, std.id, 'title'])}
              </h3>
              <p>
                {t([
                  `activities.standardsAndConditions`,
                  std.id,
                  'description'
                ])}
              </p>
              <Textarea
                id={inputId}
                name={`condition-${std.id}`}
                label={t([
                  `activities.standardsAndConditions`,
                  std.id,
                  'prompt'
                ])}
                rows="3"
                spellCheck="true"
                value={activity.standardsAndConditions[std.id]}
                onChange={this.handleChange(std.id)}
              />
            </div>
          );
        })}
      </Collapsible>
    );
  }
}

ActivityDetailStandardsAndConditions.propTypes = {
  activity: PropTypes.object.isRequired,
  updateActivity: PropTypes.func.isRequired
};

const mapStateToProps = ({ activities: { byId } }, { aId }) => ({
  activity: byId[aId]
});

const mapDispatchToProps = {
  updateActivity: updateActivityAction
};

export default connect(mapStateToProps, mapDispatchToProps)(
  ActivityDetailStandardsAndConditions
);
