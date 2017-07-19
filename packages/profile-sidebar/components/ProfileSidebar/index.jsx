import React from 'react';
import PropTypes from 'prop-types';
import {
  Text,
  Button,
  Divider,
  QuestionIcon,
} from '@bufferapp/components';
import {
  offWhite,
  mystic,
} from '@bufferapp/components/style/color';
import {
  borderWidth,
} from '@bufferapp/components/style/border';

import ProfileListItem from '../ProfileListItem';
import ProfileList from '../ProfileList';

const profileSidebarStyle = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  padding: '1rem',
  boxSizing: 'border-box',
  background: offWhite,
  borderRight: `${borderWidth} solid ${mystic}`,
};

const productTitleStyle = {
  marginRight: '0.25rem',
};

const profileListStyle = {
  flexGrow: 1,
  overflowY: 'auto',
};

const lockedAccountHeaderStyle = {
  margin: '1rem 0.5rem',
  display: 'flex',
  alignItems: 'center',
};

const lockedAccountTextStyle = {
  flexGrow: 1,
};

const buttonDividerStyle = {
  marginBottom: '1rem',
};

const ProfileSidebar = ({
  selectedProfileId,
  profiles,
  lockedProfiles,
  translations,
  onProfileClick,
}) =>
  <div style={profileSidebarStyle}>
    <div>
      <span style={productTitleStyle}>
        <Text
          color={'curiousBlue'}
          weight={'bold'}
          size={'large'}
        >
          Publish
        </Text>
      </span>
      <Text
        weight={'bold'}
        size={'large'}
      >
        Free
      </Text>
      <Divider marginTop={'1rem'} />
    </div>
    <div style={profileListStyle}>
      <ProfileList
        selectedProfileId={selectedProfileId}
        profiles={profiles}
        onProfileClick={onProfileClick}
      />
      <div style={lockedAccountHeaderStyle}>
        <div style={lockedAccountTextStyle}>
          <Text size={'small'}>
            {translations.lockedList}
          </Text>
        </div>
        <QuestionIcon />
      </div>
      <Divider />
      <ProfileList
        selectedProfileId={selectedProfileId}
        profiles={lockedProfiles}
        onProfileClick={onProfileClick}
      />
    </div>
    <div>
      <div style={buttonDividerStyle}>
        <Divider />
      </div>
      <Button
        secondary
        fillContainer
      >
        {translations.connectButton}
      </Button>
    </div>
  </div>;

ProfileSidebar.propTypes = {
  onProfileClick: ProfileList.propTypes.onProfileClick,
  selectedProfileId: ProfileList.propTypes.selectedProfileId,
  profiles: PropTypes.arrayOf(
    PropTypes.shape(ProfileListItem.propTypes),
  ),
  lockedProfiles: PropTypes.arrayOf(
    PropTypes.shape(ProfileListItem.propTypes),
  ),
  translations: PropTypes.shape({
    connectButton: PropTypes.string,
    lockedList: PropTypes.string,
  }).isRequired,
};

ProfileSidebar.defaultProps = {
  onProfileClick: ProfileList.defaultProps.onProfileClick,
  selectedProfileId: ProfileList.defaultProps.selectedProfileId,
  profiles: [],
  lockedProfiles: [],
};

export default ProfileSidebar;