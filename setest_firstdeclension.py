#!/usr/bin/env python3.4

import os
import time
import unittest

from selenium import webdriver
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class LudiTestCase(unittest.TestCase):

    def _perform_get(self):
        self.driver.get('file://%s/first-declension.html' % os.getcwd())

    def _assert_id_is_not_displayed(self, element_id):
        self.assertFalse(
            self.driver.find_element_by_id(element_id).is_displayed())

    def _assert_id_is_displayed(self, element_id):
        self.assertTrue(
            self.driver.find_element_by_id(element_id).is_displayed())

class DirectWinTestCase(LudiTestCase):
    '''
    Exercise the shortest path to winning the game.
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

    def _perform_clicks(self):
        element_ids = (
            'start-button',
            'tile-a.0',
            'tile-ae.0',
            'tile-ae.1',
            'tile-am',
            'tile-a.1',
            'tile-ae.2',
            'tile-arum',
            'tile-is.0',
            'tile-as',
            'tile-is.1',
        )
        for element_id in element_ids:
            self.driver.find_element_by_id(element_id).click()

class MistakeAtEndTestCase(LudiTestCase):
    '''
    Make a mistake at the very end and fix it.
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
            self._perform_clicks_1()
            self._assert_id_is_not_displayed('you-win')
            self._perform_clicks_2()
            self._assert_id_is_displayed('you-win')
        finally:
            self.driver.quit()

    def _perform_clicks_1(self):
        element_ids = (
            'start-button',
            'tile-a.0',
            'tile-ae.0',
            'tile-ae.1',
            'tile-am',
            'tile-a.1',
            'tile-ae.2',
            'tile-arum',
            'tile-is.0',
            'tile-is.1',
            'tile-as',
        )
        for element_id in element_ids:
            self.driver.find_element_by_id(element_id).click()

    def _perform_clicks_2(self):
        element_ids = (
            'ablative-plural',
            'accusative-plural',
            'tile-as',
            'tile-is.1',
        )
        for element_id in element_ids:
            self.driver.find_element_by_id(element_id).click()

if __name__ == '__main__':
    unittest.main()
