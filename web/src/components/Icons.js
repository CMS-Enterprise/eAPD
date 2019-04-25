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
  faFileDownload,
  faLock,
  faPlusCircle,
  faSignOutAlt,
  faSpinner,
  faUnlock,
  faUserCog,
  faUserPlus
} from '@fortawesome/free-solid-svg-icons';

import { faCircle, faClock } from '@fortawesome/free-regular-svg-icons';

const FileDownload = () => <FontAwesomeIcon icon={faFileDownload} />;
const LockIcon = () => <FontAwesomeIcon icon={faLock} />;
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
  faUnlock,
  FileDownload,
  LockIcon,
  UnlockIcon,
  faUserCog,
  faUserPlus
};

export default FontAwesomeIcon;
