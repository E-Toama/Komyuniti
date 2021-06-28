package com.example.komyuniti.ui.profile

import android.content.Context
import android.content.SharedPreferences
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import android.widget.Toast
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.lifecycle.Observer
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.ViewModelStoreOwner
import androidx.lifecycle.lifecycleScope
import androidx.navigation.Navigation
import androidx.recyclerview.widget.LinearLayoutManager
import com.example.komyuniti.MainActivity
import com.example.komyuniti.MainViewModel
import com.example.komyuniti.R
import com.example.komyuniti.databinding.FragmentProfileBinding
import com.example.komyuniti.ui.login.LoginViewModel
import kotlinx.coroutines.launch
import com.google.android.material.tabs.TabLayout
import com.google.android.material.tabs.TabLayout.*


class ProfileFragment : Fragment() {

    private lateinit var profileViewModel: ProfileViewModel
    private var _binding: FragmentProfileBinding? = null

    // This property is only valid between onCreateView and
    // onDestroyView.
    private val binding get() = _binding!!
    private var komyunitis = mutableListOf<KomyunitiData>()
    private var friends = mutableListOf<FriendData>()

    private lateinit var preferences: SharedPreferences

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val activityModel = ViewModelProvider(
            activity as ViewModelStoreOwner
        ).get(MainViewModel::class.java)
        profileViewModel =
            ViewModelProvider(this).get(ProfileViewModel::class.java)

        // init shared preferences
        preferences = activity?.getSharedPreferences("Auth", Context.MODE_PRIVATE)!!

        _binding = FragmentProfileBinding.inflate(inflater, container, false)
        val root: View = binding.root

        lifecycleScope.launch {
            val res = profileViewModel.getLoggedInUser(activityModel.getApollo(activity as Context))
            Log.d("TEST", res.data?.loggedInUser?.id!!)
        }

        initLogout(binding)

        val textView: TextView = binding.profileHeaderTitle
        profileViewModel.text.observe(viewLifecycleOwner, Observer {
            textView.text = it
        })


        //display all komyunitis connecting komyuniti Adapter
        binding.qrCode.visibility = VISIBLE
        binding.rvKomyunitiList.layoutManager = LinearLayoutManager(activity as MainActivity)
        binding.rvKomyunitiList.adapter = KomyunitiListAdapter(komyunitis)
        postToKomyuniti()
        postToFriends()

        //behaviour when tabs are clicked
        val tabLayout = binding.tabLayout
        tabLayout.addOnTabSelectedListener(object : OnTabSelectedListener {
            override fun onTabSelected(tab: TabLayout.Tab) {
                //do stuff here
                if (tab.position == 0) {
                    binding.qrCode.visibility = VISIBLE
                    binding.rvKomyunitiList.adapter = KomyunitiListAdapter(komyunitis)
                    binding.tvKomyunitisTitle.text = "My Komyunitis"

                } else if (tab.position == 1) {
                    //display friends list after tab changed
                    binding.qrCode.visibility = GONE
                    binding.rvKomyunitiList.adapter = FriendAdapter(friends)
                    binding.tvKomyunitisTitle.text = "My Friends"
                } else {
                    Toast.makeText(activity, "Something went wrong", Toast.LENGTH_SHORT).show()
                }
                Log.d("Profile Tabs",tab.position.toString())
            }

            override fun onTabUnselected(tab: TabLayout.Tab) {}
            override fun onTabReselected(tab: TabLayout.Tab) {}
        })

        return root
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    private fun initLogout(binding: FragmentProfileBinding) {
        binding.profileLogoutBtn.setOnClickListener { view: View ->
            //TODO: connection to backend quit user session
            Navigation.findNavController(view)
                .navigate(R.id.action_navigation_profile_to_loginFragment)
        }
    }
    private fun addKomyuniti(komyuniti: KomyunitiData) {
        komyunitis.add(komyuniti)
    }
    private fun postToKomyuniti() {
        for (i in 1..8) {
            addKomyuniti(KomyunitiData())
        }
    }
    private fun addFriend(friend: FriendData) {
        friends.add(friend)
    }

    private fun postToFriends() {
        for (i in 1..10) {
            addFriend(FriendData())
        }
        Log.d("ProfileFragment", komyunitis.toString())
    }
}