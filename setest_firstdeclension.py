#!/usr/bin/env python3.4

import os
import time
import unittest

from selenium import webdriver
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class ShortestPathToWinTestCase(unittest.TestCase):
    '''
    Exercise shortest path to winning the game.
    '''

    def test_chrome(self):
        self.driver = webdriver.Chrome()
        self._perform_test()

    def test_firefox(self):
        self.driver = webdriver.Firefox()
        self._perform_test()

    def _perform_test(self):
        try:
            self._perform_get()
            self._assert_id_is_not_displayed('you-win')
            self._perform_clicks()
            self._assert_id_is_displayed('you-win')
        finally:
            self.driver.quit()

    def _assert_id_is_not_displayed(self, element_id):
        self.assertFalse(
            self.driver.find_element_by_id(element_id).is_displayed())

    def _assert_id_is_displayed(self, element_id):
        self.assertTrue(
            self.driver.find_element_by_id(element_id).is_displayed())

    def _perform_get(self):
        self.driver.get('file://%s/first-declension.html' % os.getcwd())

    def _perform_clicks(self):
        element_ids = (
            'start-button',
            'ending-a.0',
            'ending-ae.0',
            'ending-ae.1',
            'ending-am',
            'ending-a.1',
            'ending-ae.2',
            'ending-arum',
            'ending-is.0',
            'ending-as',
            'ending-is.1',
        )
        for element_id in element_ids:
            self.driver.find_element_by_id(element_id).click()

if __name__ == '__main__':
    unittest.main()
