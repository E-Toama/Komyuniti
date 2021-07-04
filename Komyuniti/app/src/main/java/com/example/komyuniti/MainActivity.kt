package com.example.komyuniti

import android.os.Bundle
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.lifecycleScope
import androidx.navigation.Navigation
import androidx.navigation.findNavController
import androidx.navigation.ui.AppBarConfiguration
import androidx.navigation.ui.setupActionBarWithNavController
import androidx.navigation.ui.setupWithNavController
import com.example.komyuniti.databinding.ActivityMainBinding
import com.google.android.material.bottomnavigation.BottomNavigationView
import kotlinx.coroutines.launch

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // init view model
        val viewModel = ViewModelProvider(this).get(MainViewModel::class.java)

        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)
        //setMainNavigationController()

        // check login state
        /*
        lifecycleScope.launch {
            val loggedIn = viewModel.checkLoginState(this@MainActivity)

            // route to profile
            if (loggedIn) {
                Navigation.findNavController(this@MainActivity, R.id.NavHostFragment)
                    .navigate(R.id.action_loginFragment_to_mobile_navigation)
            } else {
                Toast.makeText(this@MainActivity, "Not logged in", Toast.LENGTH_LONG).show()
            }
        }

         */


        //hide top
        supportActionBar?.hide()

    }

    fun setMainNavigationController() {
        //Controller für Bottom Navigation
        val navView: BottomNavigationView = binding.navView
        //set bottom nav visible
        navView.visibility = BottomNavigationView.VISIBLE;

        val navController = Navigation.findNavController(this, R.id.NavHostFragment)
        // Passing each menu ID as a set of Ids because each
        // menu should be considered as top level destinations.
        val appBarConfiguration = AppBarConfiguration(
            setOf(
                R.id.navigation_feed, R.id.navigation_events, R.id.navigation_profile
            )
        )
        setupActionBarWithNavController(navController, appBarConfiguration)
        navView.setupWithNavController(navController)
    }
}



