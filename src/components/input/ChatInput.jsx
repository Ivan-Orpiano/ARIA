import React, { useState, useRef, useCallback, useEffect } from 'react';
import FileUpload       from './FileUpload';
import { useFileUpload } from '../../hooks/useFileUpload';
import { isEmpty }      from '../../utils/messageUtils';
import { MAX_FILES_PER_MSG } from '../../utils/fileUtils';
