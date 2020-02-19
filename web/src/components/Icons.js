import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// to optimize bundle, explicitly importing only the icons used
import {
  faArrowRight,
  faCheckCircle,
  faChevronDown,
  faChevronLeft,
  faChevronUp,
  faEdit,
  faExclamationTriangle,
  faFileAlt,
  faFileDownload,
  faLock,
  faPlusCircle,
  faSignOutAlt,
  faSpinner,
  faUnlock,
  faUserCog,
  faUserPlus
} from '@fortawesome/free-solid-svg-icons';

import {
  faCircle,
  faClock,
  faTimesCircle
} from '@fortawesome/free-regular-svg-icons';

const CheckCircle = ({ ...props }) => (
  <FontAwesomeIcon icon={faCheckCircle} {...props} />
);
const File = ({ ...props }) => <FontAwesomeIcon icon={faFileAlt} {...props} />;
const FileDownload = () => <FontAwesomeIcon icon={faFileDownload} />;
const LockIcon = () => <FontAwesomeIcon icon={faLock} />;
const TimesCircle = () => <FontAwesomeIcon icon={faTimesCircle} />;
const UnlockIcon = () => <FontAwesomeIcon icon={faUnlock} />;

export {
  faArrowRight,
  faCheckCircle,
  faChevronDown,
  faChevronLeft,
  faChevronUp,
  faCircle,
  faClock,
  faEdit,
  faExclamationTriangle,
  faLock,
  faPlusCircle,
  faSignOutAlt,
  faSpinner,
  faTimesCircle,
  faUnlock,
  CheckCircle,
  File,
  FileDownload,
  LockIcon,
  TimesCircle,
  UnlockIcon,
  faUserCog,
  faUserPlus
};

export default FontAwesomeIcon;
